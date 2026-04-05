/**
 * Onboarding Wizard — 4 steps + AI goal result card
 *
 * Step 1 — About you: gender, age
 * Step 2 — Body: height (cm), current weight (kg)
 * Step 3 — Activity level: 5 option pills
 * Step 4 — Goal: lose / maintain / gain + weight-delta input
 * Result — AI-generated calorie + macro targets with reasoning
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Colors,
  Elevation,
  FontFamily,
  FontSize,
  LineHeight,
  Radius,
  Spacing,
} from '@/constants/theme';
import { useGoalCalculation } from '@/hooks/use-goal-calculation';
import { GoalInput } from '@/services/goal-calculation';
import { supabase } from '@/lib/supabase';
import { upsertUserProfile } from '@/services/user-profile';

// ─── Types ────────────────────────────────────────────────────────────────────

type Gender = 'male' | 'female';
type ActivityLevel = GoalInput['activityLevel'];
type Goal = 'lose' | 'maintain' | 'gain';

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; sub: string }[] = [
  { value: 'sedentary', label: 'Sedentary', sub: 'Little or no exercise' },
  { value: 'lightly_active', label: 'Lightly active', sub: '1–3 days/week' },
  { value: 'moderately_active', label: 'Moderately active', sub: '3–5 days/week' },
  { value: 'very_active', label: 'Very active', sub: '6–7 days/week' },
  { value: 'extra_active', label: 'Extra active', sub: 'Physical job + daily exercise' },
];

const GOAL_OPTIONS: { value: Goal; label: string; icon: string }[] = [
  { value: 'lose', label: 'Lose weight', icon: '📉' },
  { value: 'maintain', label: 'Maintain weight', icon: '⚖️' },
  { value: 'gain', label: 'Gain weight', icon: '📈' },
];

const GAIN_APPROACH_OPTIONS: { value: string; label: string; sub: string }[] = [
  { value: 'lean_bulk', label: 'Lean Bulk', sub: '+250–350 kcal surplus, high protein' },
  { value: 'balanced_gain', label: 'Balanced Gain', sub: '+300–450 kcal surplus' },
  { value: 'aggressive_bulk', label: 'Aggressive Bulk', sub: '+400–500 kcal surplus' },
];

const LOSE_APPROACH_OPTIONS: { value: string; label: string; sub: string }[] = [
  { value: 'gradual_cut', label: 'Gradual Cut', sub: '−250–350 kcal, minimal muscle loss' },
  { value: 'moderate_cut', label: 'Moderate Cut', sub: '−350–500 kcal, steady pace' },
  { value: 'aggressive_cut', label: 'Aggressive Cut', sub: '−500–700 kcal, faster loss' },
];

const RESISTANCE_OPTIONS: { value: string; label: string; sub: string }[] = [
  { value: 'none', label: 'None', sub: 'No strength training' },
  { value: 'light', label: 'Light', sub: '1–2x per week' },
  { value: 'moderate', label: 'Moderate', sub: '3–4x per week' },
  { value: 'high', label: 'High', sub: '5+ per week' },
];

const TOTAL_STEPS = 4;

// ─── OnboardingScreen ─────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState('');

  // Step 2
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // Step 3
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderately_active');

  // Step 4
  const [goal, setGoal] = useState<Goal>('lose');
  const [weightDelta, setWeightDelta] = useState('');
  const [goalApproach, setGoalApproach] = useState('moderate_cut');
  const [resistanceTraining, setResistanceTraining] = useState<GoalInput['resistanceTraining']>('none');

  // Reset approach when goal direction changes
  function handleGoalChange(g: Goal) {
    setGoal(g);
    if (g === 'gain') setGoalApproach('lean_bulk');
    else if (g === 'lose') setGoalApproach('moderate_cut');
    else setGoalApproach('maintain');
  }

  // AI
  const { calculate, result, loading: aiLoading, error: aiError, reset } = useGoalCalculation();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Validation helpers ──

  function validateStep(): string | null {
    if (step === 1) {
      if (!age || isNaN(Number(age)) || Number(age) < 13 || Number(age) > 100)
        return 'Please enter a valid age (13–100).';
    }
    if (step === 2) {
      if (!height || isNaN(Number(height)) || Number(height) < 100 || Number(height) > 250)
        return 'Please enter a valid height (100–250 cm).';
      if (!weight || isNaN(Number(weight)) || Number(weight) < 30 || Number(weight) > 300)
        return 'Please enter a valid weight (30–300 kg).';
    }
    if (step === 4 && goal !== 'maintain') {
      if (!weightDelta || isNaN(Number(weightDelta)) || Number(weightDelta) <= 0)
        return 'Please enter how much weight you want to lose or gain.';
    }
    return null;
  }

  // ── Navigation ──

  const [stepError, setStepError] = useState<string | null>(null);

  function goNext() {
    const err = validateStep();
    if (err) { setStepError(err); return; }
    setStepError(null);

    if (step < 4) {
      setStep((s) => (s + 1) as typeof step);
    } else {
      handleGetPlan();
    }
  }

  function goBack() {
    setStepError(null);
    reset();
    if (step > 1) setStep((s) => (s - 1) as typeof step);
  }

  // ── AI call ──

  async function handleGetPlan() {
    const input: GoalInput = {
      gender,
      age: Number(age),
      heightCm: Number(height),
      weightKg: Number(weight),
      activityLevel,
      goal,
      targetWeightDeltaKg: goal === 'maintain' ? 0 : Number(weightDelta),
      goalApproach,
      resistanceTraining,
    };
    await calculate(input);
  }

  // ── Save + finish ──

  async function handleConfirm() {
    if (!result) return;
    setSaving(true);
    setSaveError(null);
    try {
      // Also persist displayName stored in auth metadata during registration
      const { data: { user } } = await supabase.auth.getUser();
      const displayName = user?.user_metadata?.display_name as string | undefined;

      await upsertUserProfile({
        displayName,
        calorieGoal: result.calorieGoal,
        proteinGoal: result.proteinGoal,
        carbsGoal: result.carbsGoal,
        fatsGoal: result.fatsGoal,
      });
      router.replace('/(tabs)');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save. Please try again.');
      setSaving(false);
    }
  }

  // ── Render ──

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            {step > 1 && !result ? (
              <Pressable onPress={goBack} style={styles.backBtn} hitSlop={8}>
                <Ionicons name="chevron-back" size={22} color={Colors.onSurface} />
              </Pressable>
            ) : (
              <View style={styles.backBtn} />
            )}
            <Text style={styles.stepLabel}>
              {result ? 'Your plan' : `Step ${step} of ${TOTAL_STEPS}`}
            </Text>
            <View style={styles.backBtn} />
          </View>

          {/* ── Progress bar ── */}
          {!result && (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(step / TOTAL_STEPS) * 100}%` },
                ]}
              />
            </View>
          )}

          {/* ── Content ── */}
          {result ? (
            <ResultCard
              result={result}
              goal={goal}
              saving={saving}
              saveError={saveError}
              onConfirm={handleConfirm}
              onBack={() => { reset(); setStepError(null); }}
            />
          ) : (
            <>
              {step === 1 && (
                <StepAboutYou
                  gender={gender}
                  age={age}
                  onGender={setGender}
                  onAge={setAge}
                />
              )}
              {step === 2 && (
                <StepBody
                  height={height}
                  weight={weight}
                  onHeight={setHeight}
                  onWeight={setWeight}
                />
              )}
              {step === 3 && (
                <StepActivity
                  value={activityLevel}
                  onChange={setActivityLevel}
                />
              )}
              {step === 4 && (
                <StepGoal
                  goal={goal}
                  weightDelta={weightDelta}
                  goalApproach={goalApproach}
                  resistanceTraining={resistanceTraining}
                  onGoal={handleGoalChange}
                  onWeightDelta={setWeightDelta}
                  onGoalApproach={setGoalApproach}
                  onResistanceTraining={setResistanceTraining}
                />
              )}

              {stepError ? (
                <Text style={styles.errorText}>{stepError}</Text>
              ) : null}

              {aiError ? (
                <Text style={styles.errorText}>{aiError}</Text>
              ) : null}

              <Pressable
                style={[styles.cta, aiLoading && styles.ctaDisabled]}
                onPress={goNext}
                disabled={aiLoading}
                android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
              >
                {aiLoading ? (
                  <View style={styles.ctaRow}>
                    <ActivityIndicator color={Colors.onPrimary} size="small" />
                    <Text style={styles.ctaLabel}>Calculating your plan…</Text>
                  </View>
                ) : (
                  <Text style={styles.ctaLabel}>
                    {step < 4 ? 'Continue' : 'Get My Plan'}
                  </Text>
                )}
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Step 1 — About You ───────────────────────────────────────────────────────

type Step1Props = {
  gender: Gender;
  age: string;
  onGender: (g: Gender) => void;
  onAge: (a: string) => void;
};

function StepAboutYou({ gender, age, onGender, onAge }: Step1Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>About you</Text>
      <Text style={styles.cardSub}>This helps us personalise your nutrition plan.</Text>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>Gender</Text>
        <View style={styles.pillRow}>
          {(['male', 'female'] as Gender[]).map((g) => (
            <Pressable
              key={g}
              style={[styles.pill, gender === g && styles.pillActive]}
              onPress={() => onGender(g)}
            >
              <Text style={[styles.pillLabel, gender === g && styles.pillLabelActive]}>
                {g === 'male' ? 'Male' : 'Female'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>Age</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputFlex}
            value={age}
            onChangeText={onAge}
            placeholder="e.g. 28"
            placeholderTextColor={Colors.onSurfaceVariant}
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.unit}>years</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Step 2 — Body ────────────────────────────────────────────────────────────

type Step2Props = {
  height: string;
  weight: string;
  onHeight: (v: string) => void;
  onWeight: (v: string) => void;
};

function StepBody({ height, weight, onHeight, onWeight }: Step2Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Your body</Text>
      <Text style={styles.cardSub}>Used to estimate your baseline calorie needs.</Text>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>Height</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputFlex}
            value={height}
            onChangeText={onHeight}
            placeholder="e.g. 175"
            placeholderTextColor={Colors.onSurfaceVariant}
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.unit}>cm</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>Current weight</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputFlex}
            value={weight}
            onChangeText={onWeight}
            placeholder="e.g. 75"
            placeholderTextColor={Colors.onSurfaceVariant}
            keyboardType="numeric"
            maxLength={5}
          />
          <Text style={styles.unit}>kg</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Step 3 — Activity ────────────────────────────────────────────────────────

type Step3Props = {
  value: ActivityLevel;
  onChange: (v: ActivityLevel) => void;
};

function StepActivity({ value, onChange }: Step3Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Activity level</Text>
      <Text style={styles.cardSub}>How active are you on a typical week?</Text>

      <View style={styles.activityList}>
        {ACTIVITY_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[styles.activityPill, value === opt.value && styles.activityPillActive]}
            onPress={() => onChange(opt.value)}
          >
            <View style={styles.activityTextCol}>
              <Text style={[styles.activityLabel, value === opt.value && styles.activityLabelActive]}>
                {opt.label}
              </Text>
              <Text style={[styles.activitySub, value === opt.value && styles.activitySubActive]}>
                {opt.sub}
              </Text>
            </View>
            {value === opt.value && (
              <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Step 4 — Goal ────────────────────────────────────────────────────────────

type Step4Props = {
  goal: Goal;
  weightDelta: string;
  goalApproach: string;
  resistanceTraining: GoalInput['resistanceTraining'];
  onGoal: (g: Goal) => void;
  onWeightDelta: (v: string) => void;
  onGoalApproach: (v: string) => void;
  onResistanceTraining: (v: GoalInput['resistanceTraining']) => void;
};

function StepGoal({
  goal, weightDelta, goalApproach, resistanceTraining,
  onGoal, onWeightDelta, onGoalApproach, onResistanceTraining,
}: Step4Props) {
  const approachOptions = goal === 'gain' ? GAIN_APPROACH_OPTIONS
    : goal === 'lose' ? LOSE_APPROACH_OPTIONS
    : null;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Your goal</Text>
      <Text style={styles.cardSub}>What are you working towards?</Text>

      {/* Direction pills */}
      <View style={styles.goalGrid}>
        {GOAL_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[styles.goalPill, goal === opt.value && styles.goalPillActive]}
            onPress={() => onGoal(opt.value)}
          >
            <Text style={styles.goalIcon}>{opt.icon}</Text>
            <Text style={[styles.goalLabel, goal === opt.value && styles.goalLabelActive]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Weight delta */}
      {goal !== 'maintain' && (
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>
            How much do you want to {goal}?
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              value={weightDelta}
              onChangeText={onWeightDelta}
              placeholder="e.g. 5"
              placeholderTextColor={Colors.onSurfaceVariant}
              keyboardType="numeric"
              maxLength={4}
            />
            <Text style={styles.unit}>kg</Text>
          </View>
        </View>
      )}

      {/* Approach — only for lose / gain */}
      {approachOptions && (
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Approach</Text>
          <View style={styles.activityList}>
            {approachOptions.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.activityPill, goalApproach === opt.value && styles.activityPillActive]}
                onPress={() => onGoalApproach(opt.value)}
              >
                <View style={styles.activityTextCol}>
                  <Text style={[styles.activityLabel, goalApproach === opt.value && styles.activityLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.activitySub, goalApproach === opt.value && styles.activitySubActive]}>
                    {opt.sub}
                  </Text>
                </View>
                {goalApproach === opt.value && (
                  <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Resistance training */}
      <View style={styles.section}>
        <Text style={styles.fieldLabel}>Resistance training</Text>
        <View style={styles.activityList}>
          {RESISTANCE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.activityPill, resistanceTraining === opt.value && styles.activityPillActive]}
              onPress={() => onResistanceTraining(opt.value as GoalInput['resistanceTraining'])}
            >
              <View style={styles.activityTextCol}>
                <Text style={[styles.activityLabel, resistanceTraining === opt.value && styles.activityLabelActive]}>
                  {opt.label}
                </Text>
                <Text style={[styles.activitySub, resistanceTraining === opt.value && styles.activitySubActive]}>
                  {opt.sub}
                </Text>
              </View>
              {resistanceTraining === opt.value && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────

type ResultCardProps = {
  result: { calorieGoal: number; proteinGoal: number; carbsGoal: number; fatsGoal: number; reasoning: string };
  goal: Goal;
  saving: boolean;
  saveError: string | null;
  onConfirm: () => void;
  onBack: () => void;
};

function ResultCard({ result, saving, saveError, onConfirm, onBack }: ResultCardProps) {
  return (
    <View style={styles.resultWrapper}>
      {/* AI badge */}
      <View style={styles.aiBadge}>
        <Ionicons name="sparkles" size={14} color={Colors.primary} />
        <Text style={styles.aiBadgeText}>AI ANALYSIS</Text>
      </View>

      {/* Calorie hero */}
      <View style={styles.calorieHero}>
        <Text style={styles.calorieNumber}>{result.calorieGoal}</Text>
        <Text style={styles.calorieUnit}>kcal / day</Text>
      </View>

      {/* Reasoning */}
      <View style={styles.reasoningCard}>
        <Text style={styles.reasoningText}>{result.reasoning}</Text>
      </View>

      {/* Macro chips */}
      <View style={styles.macroRow}>
        <MacroChip label="Protein" value={result.proteinGoal} color={Colors.secondary} />
        <MacroChip label="Carbs" value={result.carbsGoal} color={Colors.primary} />
        <MacroChip label="Fats" value={result.fatsGoal} color="#c47800" />
      </View>

      {saveError ? (
        <Text style={styles.errorText}>{saveError}</Text>
      ) : null}

      {/* CTAs */}
      <Pressable
        style={[styles.cta, saving && styles.ctaDisabled]}
        onPress={onConfirm}
        disabled={saving}
        android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
      >
        {saving
          ? <ActivityIndicator color={Colors.onPrimary} />
          : <Text style={styles.ctaLabel}>Confirm & Start Tracking</Text>
        }
      </Pressable>

      <Pressable onPress={onBack} style={styles.backLink}>
        <Text style={styles.backLinkText}>Recalculate</Text>
      </Pressable>
    </View>
  );
}

type MacroChipProps = { label: string; value: number; color: string };

function MacroChip({ label, value, color }: MacroChipProps) {
  return (
    <View style={[styles.macroChip, { backgroundColor: color + '18' }]}>
      <Text style={[styles.macroValue, { color }]}>{value}g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: FontSize.labelMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  // Progress
  progressTrack: {
    height: 4,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },

  // Card
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xxl,
    padding: Spacing.six,
    gap: Spacing.five,
    ...Elevation.card,
  },
  cardTitle: {
    fontSize: FontSize.headlineSm,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.headlineSm,
    letterSpacing: -0.3,
  },
  cardSub: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    marginTop: -Spacing.three,
  },

  // Section
  section: { gap: Spacing.two },
  fieldLabel: {
    fontSize: FontSize.labelMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    height: 52,
    gap: Spacing.two,
  },
  inputFlex: {
    flex: 1,
    fontSize: FontSize.bodyLg,
    fontFamily: FontFamily.body,
    color: Colors.onSurface,
  },
  unit: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },

  // Pills (gender)
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  pill: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: Colors.primaryContainer },
  pillLabel: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },
  pillLabelActive: { color: Colors.onPrimaryContainer },

  // Activity options
  activityList: { gap: Spacing.two },
  activityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  activityPillActive: { backgroundColor: Colors.primaryContainer },
  activityTextCol: { gap: 2, flex: 1 },
  activityLabel: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurface,
  },
  activityLabelActive: { color: Colors.onPrimaryContainer },
  activitySub: {
    fontSize: FontSize.bodySm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  activitySubActive: { color: Colors.onPrimaryContainer },

  // Goal options
  goalGrid: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  goalPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.four,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.md,
    gap: Spacing.one,
  },
  goalPillActive: { backgroundColor: Colors.primaryContainer },
  goalIcon: { fontSize: 24 },
  goalLabel: {
    fontSize: FontSize.bodySm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  goalLabelActive: { color: Colors.onPrimaryContainer },

  // CTA
  cta: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { opacity: 0.6 },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  ctaLabel: {
    fontSize: FontSize.bodyLg,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onPrimary,
    letterSpacing: 0.2,
  },

  // Error
  errorText: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.error,
    textAlign: 'center',
  },

  // Result card
  resultWrapper: {
    gap: Spacing.five,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: Spacing.one,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.full,
  },
  aiBadgeText: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onPrimaryContainer,
    letterSpacing: 1.2,
  },
  calorieHero: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  calorieNumber: {
    fontSize: FontSize.displayMd,
    fontFamily: FontFamily.displayExtraBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.displayMd,
    letterSpacing: -1,
  },
  calorieUnit: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  reasoningCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.five,
    ...Elevation.card,
  },
  reasoningText: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurface,
    lineHeight: LineHeight.bodyMd,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  macroRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  macroChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.four,
    borderRadius: Radius.md,
    gap: Spacing.one,
  },
  macroValue: {
    fontSize: FontSize.titleMd,
    fontFamily: FontFamily.displayBold,
  },
  macroLabel: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  backLinkText: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },
});

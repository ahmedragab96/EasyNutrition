import { StyleSheet } from 'react-native';

import { Colors, FontFamily, FontSize, LineHeight, Radius, Spacing } from '@/constants/theme';

// ─── Meal-type pills (used in PreviewPane, AiResultCard, BarcodeResultCard) ───

export const pillStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
  },
  pillActive: { backgroundColor: Colors.primaryContainer },
  pillIcon: { fontSize: 18 },
  pillLabel: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },
  pillLabelActive: { color: Colors.onPrimaryContainer },
});

// ─── Macro chips (used in AiResultCard, BarcodeResultCard) ───────────────────

export const chipStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    gap: 2,
  },
  chipHighlight: { backgroundColor: Colors.primaryContainer },
  chipValue: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
  },
  chipValueHighlight: { color: Colors.onPrimaryContainer },
  chipLabel: {
    fontSize: 9,
    fontFamily: FontFamily.bodyBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  chipLabelHighlight: { color: Colors.onPrimaryContainer },
});

// ─── Shared card / CTA (used in AiResultCard, BarcodeResultCard) ─────────────

export const cardStyles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: Spacing.three, paddingBottom: Spacing.four },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardTitle: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
  },
  cardSub: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    height: 52,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaBtnBusy: { opacity: 0.75 },
  ctaLabel: {
    fontSize: FontSize.bodyLg,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onPrimary,
  },
});

// ─── Camera permission / error (used in CameraPane, BarcodeScanPane) ─────────

export const cameraSharedStyles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.eight,
  },
  permTitle: {
    fontSize: FontSize.titleMd,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  permSub: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: LineHeight.bodyMd,
  },
  permBtn: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.three,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  permBtnLabel: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onPrimary,
  },
  errorCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xxl,
    paddingVertical: Spacing.eight,
    paddingHorizontal: Spacing.six,
    alignItems: 'center',
    gap: Spacing.three,
    width: '80%',
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  errorTitle: {
    fontSize: FontSize.titleMd,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
  },
  errorSub: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});

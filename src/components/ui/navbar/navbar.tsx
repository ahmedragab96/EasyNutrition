import React from 'react';
import { Text, View } from 'react-native';

import { AppBar } from '../app-bar';
import { UserAvatar, type UserAvatarProps } from '../user-avatar';
import { styles } from './navbar.styles';

export type NavbarProps = {
  greeting?: string;
  date?: string;
  avatar?: UserAvatarProps;
};

function BrandBlock({ greeting, date }: Pick<NavbarProps, 'greeting' | 'date'>) {
  return (
    <View style={styles.brandBlock}>
      <Text style={styles.brandName} numberOfLines={1}>
        EasyNutrition
      </Text>
      {greeting ? (
        <Text style={styles.greeting} numberOfLines={1}>
          {greeting}
        </Text>
      ) : null}
      {date ? (
        <Text style={styles.date} numberOfLines={1}>
          {date}
        </Text>
      ) : null}
    </View>
  );
}

export function Navbar({ greeting, date, avatar }: NavbarProps) {
  return (
    <AppBar
      style={greeting || date ? styles.tall : undefined}
      leftSlot={<BrandBlock greeting={greeting} date={date} />}
      rightSlot={<UserAvatar size={44} {...avatar} />}
    />
  );
}

import React from 'react';
import { TouchableOpacity, Linking } from 'react-native';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

export function ExternalLink({ href, children }: ExternalLinkProps) {
  const handlePress = () => {
    Linking.openURL(href);
  };

  return <TouchableOpacity onPress={handlePress}>{children}</TouchableOpacity>;
} 
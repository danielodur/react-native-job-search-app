import { Text, TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'subtitle' | 'defaultSemiBold' | 'link';
};

export function ThemedText(props: ThemedTextProps) {
  const { style, lightColor, darkColor, type = 'default', ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const textStyle = [
    { color },
    styles.default,
    type === 'title' && styles.title,
    type === 'subtitle' && styles.subtitle,
    type === 'defaultSemiBold' && styles.defaultSemiBold,
    type === 'link' && styles.link,
    style,
  ];

  return <Text style={textStyle} {...otherProps} />;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  defaultSemiBold: {
    fontWeight: '600',
  },
  link: {
    color: '#2e78b7',
    textDecorationLine: 'underline',
  },
}); 
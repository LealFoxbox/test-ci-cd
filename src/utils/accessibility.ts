import { AccessibilityProps } from 'react-native';

type AutomationProps = {
  testID?: string;
};

type AccessibilityAndAutomationProps = AccessibilityProps & AutomationProps;

export function getAccessibilityAndAutomationProps(label: string): AccessibilityAndAutomationProps {
  return {
    accessible: true,
    accessibilityLabel: label,
    testID: label,
  };
}

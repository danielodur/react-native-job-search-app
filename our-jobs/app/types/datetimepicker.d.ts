declare module '@react-native-community/datetimepicker' {
  import { ComponentProps } from 'react';
  
  interface DateTimePickerProps extends ComponentProps<any> {
    value: Date;
    mode?: 'date' | 'time';
    display?: 'default' | 'spinner';
    onChange?: (event: any, date?: Date) => void;
    maximumDate?: Date;
    minimumDate?: Date;
  }

  const DateTimePicker: React.FC<DateTimePickerProps>;
  export default DateTimePicker;
} 
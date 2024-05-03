import { Input } from 'semantic-ui-react';
import './style.scss';
import { useStores } from '../../stores';

export const SwapInput = (props: {
  value: string;
  setValue: any;
  error?: boolean;
  placeholder?: string;
  width?: string;
  disabled?: boolean;
}) => {
  const {theme} =useStores();
  return (
    <Input
      disabled={props.disabled === true}
      style={{
        padding: 0,
      }}

      className={`customInput`}
      transparent
      size="massive"
      placeholder={(props.error)?'-':props.placeholder || '0.0'}
      value={props.value}
      onChange={(_, { value }: { value: string }) => {
        props.setValue(value);
      }}
    />
  );
};

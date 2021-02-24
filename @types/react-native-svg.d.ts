declare module '*.svg' {
  import { SvgProps } from 'react-native-svg';

  type extraProps = {
    fillIconColor?: string;
    strokeColor?: string;
  };

  const content: React.FC<SvgProps & extraProps>;

  // eslint-disable-next-line import/no-default-export
  export default content;
}

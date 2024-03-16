export type Styles = {
  blackout: string;
  container: string;
  content: string;
  dark: string;
  input: string;
  login: string;
  pitch: string;
  register: string;
  registerButton: string;
  social: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;

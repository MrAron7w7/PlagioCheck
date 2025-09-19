// spectacle-theme.tsx
import { DefaultTemplate } from "spectacle";

export const SpectacleTheme = {
  ...DefaultTemplate,
  colors: {
    ...DefaultTemplate,
    primary: "#3B82F6",
    secondary: "#1E40AF",
    tertiary: "#FFFFFF",
    quaternary: "#F59E0B",
    quinary: "#8B5CF6",
  },
  fonts: {
    header: '"Open Sans Condensed", Helvetica, Arial, sans-serif',
    text: '"Open Sans", Helvetica, Arial, sans-serif',
  },
};

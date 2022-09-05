import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import styles from './styles';

const config: ThemeConfig = {
  useSystemColorMode: true,
};

const colors = {
  brand: {
    900: '#1a365d',
    800: '#153e75',
    700: '#2a69ac',
  },
};

const semanticTokens = {
  colors: {
    primary: {
      _dark: 'yellow',
    },
  },
};

const overrides = { config, colors, semanticTokens, styles };

const theme = extendTheme(overrides);

export default theme;

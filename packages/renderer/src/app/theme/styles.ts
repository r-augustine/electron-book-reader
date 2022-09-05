import { type StyleFunctionProps } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
export default {
  global: (props: StyleFunctionProps) => ({
    'html, body, #root': {
      height: '100%',
      margin: 0,
    },
    body: {
      background: mode('white', 'gray.800')(props),
    },
    'nav a.active': {
      background: mode('gray.200', 'teal.900')(props),
    },
  }),
};

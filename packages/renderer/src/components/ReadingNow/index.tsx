import React from 'react';
import { Box, Divider, Heading, HStack, Image, VStack } from '@chakra-ui/react';
// import { motion } from 'framer-motion';

const items = [1, 2, 3, 4, 5, 7, 8, 9];

const ReadingNow = () => {
  return (
    <Box
      p={4}
      mb={4}
      flex="1"
      alignItems="stretch"
    >
      <VStack
        alignItems="stretch"
        spacing={4}
        mb={12}
      >
        <Heading size="xl">Reading now</Heading>
        <Divider />
      </VStack>
      <HStack
        pb={5}
        spacing={6}
        display="flex"
        overflowX="auto" // remove scroll bar from the container
      >
        {items.map((v, i) => (
          <Image
            src="https://via.placeholder.com/200X260"
            alt="book"
            objectFit="cover"
            key={i}
          />
        ))}
      </HStack>
    </Box>
  );
};

export default ReadingNow;

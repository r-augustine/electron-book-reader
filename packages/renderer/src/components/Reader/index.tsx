import { Box, Portal } from '@chakra-ui/react';
import React, { useEffect, useReducer } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Item {
  href: string;
  html: string;
  'media-type': string;
}

interface Book {
  metadata: object;
  manifest: {
    item: Array<Item>;
  };
  path: string;
  spine: {
    itemref: Array<{ idref: string; linear: string }>;
  };
  currentPageID: number;
}

// need to use immmer for deeply nested states
const readerReducer = (state: Book, action: { type: string; payload?: object }): Book => {
  switch (action.type) {
    default:
      return state;
  }
};

const init = (book: Book) => {
  return { ...book, currentPageID: 0 };
};

const Reader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [book, dispatch] = useReducer(readerReducer, location.state as Book, init);
  const currentPage =
    book.manifest.item.find((v, i) => i === book.currentPageID)?.html ?? 'Not Found';

  console.log(currentPage);

  const next = () => {
    dispatch({ type: 'NEXT' });
  };

  const goBack = () => {
    navigate('/');
  };

  useEffect(() => {
    console.log(book);
    console.log(book.currentPageID);
    console.log();
  }, []);

  return (
    <Portal>
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          background: 'gray.800',
        }}
      >
        <button onClick={goBack}>Go Back</button>
        <button onClick={next}>Next</button>
        <div
          dangerouslySetInnerHTML={{
            __html: currentPage,
          }}
        />
      </Box>
    </Portal>
  );
};

export default Reader;

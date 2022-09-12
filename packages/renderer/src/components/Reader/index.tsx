import { Box, Portal } from '@chakra-ui/react';
import React, { useEffect, useReducer } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useImmerReducer } from 'use-immer';

interface Item {
  id: string;
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
    case 'next':
      state.currentPageID = Math.min(state.currentPageID + 1, state.spine.itemref.length);
      return state;
    case 'previous':
      state.currentPageID = Math.max(state.currentPageID - 1, 0);
      return state;
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
  const [book, dispatch] = useImmerReducer(readerReducer, location.state as Book, init);
  const pages = book.manifest.item.filter(v => v['media-type'].includes('xhtml'));
  const currentPage = book.manifest.item.find(
    v => v.id === book.spine.itemref[book.currentPageID].idref,
  )?.id;

  const next = () => {
    dispatch({ type: 'next' });
  };

  const previous = () => {
    dispatch({ type: 'previous' });
  };

  const goBack = () => {
    navigate('/');
  };

  // useEffect(() => {
  //   console.log(book);
  //   console.log(book.currentPageID);
  //   console.log(currentPage);
  // }, []);

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
        <button onClick={previous}>Previous</button>
        <button onClick={next}>Next</button>
        {pages.map(v => {
          if (v.id === currentPage) {
            return <div dangerouslySetInnerHTML={{ __html: v.html }}></div>;
          }

          return null;
        })}
      </Box>
    </Portal>
  );
};

export default Reader;

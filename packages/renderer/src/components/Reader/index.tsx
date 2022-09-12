import { Box, Portal } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useImmerReducer } from 'use-immer';
import { decode } from 'html-entities';

interface Item {
  id: string;
  href: string;
  html: string;
  'media-type': string;
}

interface Book {
  metadata: object;
  css: string[];
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

  useEffect(() => {
    console.log(book);
    console.log(book.currentPageID);
    console.log(book.manifest.item.find(b => b.id === currentPage)?.html);
  }, [currentPage]);

  return (
    <Portal>
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          minHeight: '100%',
          padding: '2em',
          zIndex: 999,
          background: 'gray.800',
        }}
      >
        <button onClick={goBack}>Go Back</button>
        <button onClick={previous}>Previous</button>
        <button onClick={next}>Next</button>
        {book.css.map(c => (
          <link
            key={c}
            rel="stylesheet"
            href={c}
            type="text/css"
          />
        ))}
        {pages.map(v => {
          if (v.id === currentPage) {
            return (
              <div
                key={v.id}
                dangerouslySetInnerHTML={{ __html: decode(v.html) }}
              ></div>
            );
          }

          return null;
        })}
      </Box>
    </Portal>
  );
};

export default Reader;

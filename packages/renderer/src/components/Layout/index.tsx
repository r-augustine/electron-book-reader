import React from 'react';
import { Outlet } from 'react-router-dom';
import { Flex } from '@chakra-ui/react';
import Sidebar from '../Sidebar';

const Layout = () => {
  return (
    <Flex
      h="full"
      w="full"
    >
      <Sidebar />
      <Outlet />
    </Flex>
  );
};

export default Layout;

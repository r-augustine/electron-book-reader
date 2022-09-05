import React from 'react';
import {
  VStack,
  Heading,
  Text,
  Icon,
  Box,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { nanoid } from 'nanoid';
import {
  IoBookOutline,
  IoBagOutline,
  IoLibraryOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoReorderFourOutline,
  IoSearchOutline,
} from 'react-icons/io5';
import { type IconType } from 'react-icons/lib';
import './index.scss';

interface MenuHeaderProps {
  content?: string;
}

interface MenuLink {
  id: string;
  to: string;
  text: string;
  icon?: IconType;
}

interface MenuItem {
  id: string;
  header: string;
  links: Array<MenuLink>;
}

const menu: Array<MenuItem> = [
  {
    id: nanoid(8),
    header: 'Read Now',
    links: [
      { id: nanoid(8), to: '/', text: 'Reading Now', icon: IoBookOutline },
      { id: nanoid(8), to: '/store', text: 'Book Store', icon: IoBagOutline },
    ],
  },
  {
    id: nanoid(8),
    header: 'Library',
    links: [
      { id: nanoid(8), to: '/all', text: 'All', icon: IoLibraryOutline },
      { id: nanoid(8), to: '/finished', text: 'Finished', icon: IoCheckmarkCircleOutline },
      { id: nanoid(8), to: '/finished', text: 'Books', icon: IoBookOutline },
      { id: nanoid(8), to: '/pdfs', text: "PDF's", icon: IoDocumentTextOutline },
    ],
  },
  {
    id: nanoid(8),
    header: 'My Collection',
    links: [
      { id: nanoid(8), to: '/collection/1', text: 'My Books', icon: IoReorderFourOutline },
      { id: nanoid(8), to: '/collection/2', text: 'Adventure', icon: IoReorderFourOutline },
    ],
  },
];

const MenuHeader = ({ content }: MenuHeaderProps) => {
  return (
    <Heading
      as="h6"
      size="sm"
    >
      {content}
    </Heading>
  );
};

const Sidebar = () => {
  return (
    <VStack
      w="210px"
      h="full"
      p={4}
      spacing={6}
      alignItems="stretch"
      direction="column"
      minW="210px"
      as="nav"
    >
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
          height="100%"
          children={<Icon as={IoSearchOutline} />}
        />
        <Input
          type="text"
          size="sm"
          placeholder="Search"
          variant="filled"
        />
      </InputGroup>
      {menu.map(item => (
        <VStack
          spacing={2}
          alignItems="stretch"
          key={item.id}
        >
          <MenuHeader content={item.header} />
          <VStack
            as="ul"
            spacing={1}
            listStyleType="none"
            alignItems="stretch"
            textAlign="left"
          >
            {item.links.map(link => (
              <li key={link.id}>
                <Text
                  py={1}
                  px={3}
                  w="full"
                  h="full"
                  as={NavLink}
                  fontSize="xs"
                  to={link.to}
                  borderRadius={4}
                  display="inline-flex"
                  alignItems="center"
                >
                  <Icon
                    as={link.icon}
                    mr={3}
                    fontSize="md"
                  />
                  {link.text}
                </Text>
              </li>
            ))}
          </VStack>
        </VStack>
      ))}
      <HStack sx={{ marginTop: 'auto !important' }}>
        <Box
          borderRadius="50%"
          w="35px"
          h="35px"
          bg="gray.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          R
        </Box>
        <Heading
          as="h6"
          size="xs"
        >
          Ricardo Augustine
        </Heading>
      </HStack>
    </VStack>
  );
};

export default Sidebar;

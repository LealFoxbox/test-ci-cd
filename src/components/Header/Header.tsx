import React from 'react';
import { StackHeaderProps } from '@react-navigation/stack';
import { Appbar } from 'react-native-paper';

type Params = undefined | { title: string };

const Header: React.FC<StackHeaderProps> = ({ navigation, previous, scene }) => {
  const params = scene.route.params as Params;

  return (
    <Appbar.Header dark>
      {!!previous && <Appbar.BackAction onPress={() => navigation.goBack()} />}
      <Appbar.Content title={params?.title} />
      {scene.descriptor.options.headerRight || null}
    </Appbar.Header>
  );
};

export default Header;

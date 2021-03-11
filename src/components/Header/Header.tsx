import React from 'react';
import { StackHeaderProps } from '@react-navigation/stack';
import { Appbar } from 'react-native-paper';

type Params = undefined | { title: string; hasSubheader: boolean; hasSearch: boolean };

const Header: React.FC<StackHeaderProps> = ({ navigation, previous, scene }) => {
  const params = scene.route.params as Params;
  const left = scene.descriptor.options.headerLeft || null;
  const right = scene.descriptor.options.headerRight || null;
  const searchButton = !params?.hasSearch ? null : (
    <Appbar.Action
      icon="magnify"
      onPress={() => {
        console.warn(Math.random());
      }}
    />
  );

  return (
    <Appbar.Header dark style={{ elevation: params?.hasSubheader ? 0 : 4 }}>
      {typeof left === 'function'
        ? left({})
        : left || (!!previous && <Appbar.BackAction onPress={() => navigation.goBack()} />)}
      <Appbar.Content title={params?.title} />
      {typeof right === 'function' ? right({}) : right || searchButton}
    </Appbar.Header>
  );
};

export default Header;

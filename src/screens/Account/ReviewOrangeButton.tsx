import React, { useCallback } from 'react';
import { Text } from 'react-native-paper';
import { TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import paperTheme, { styled } from 'src/paperTheme';
import { rate } from 'src/services/rate';

const ButtonStyled = styled(TouchableOpacity)`
  padding: 12px 18px;
  background-color: ${paperTheme.colors.primary};
  width: 300px;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;

const TextStyled = styled(Text)`
  color: ${paperTheme.colors.surface};
  font-weight: 700;
  font-size: 18px;
  text-transform: none;
  letter-spacing: -0px;
`;

const ViewStyled = styled(View)`
  margin-top: 16px;
  margin-bottom: 26px;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const RateContainer = styled.TouchableOpacity`
  border-radius: 100px;
  background-color: ${paperTheme.colors.surface};
  justify-content: center;
  align-items: center;
  margin-right: 10px;
`;

const ReviewOrangeButton: React.FC<{}> = () => {
  const showAppReview = useCallback(async () => {
    await rate();
  }, []);
  return (
    <ViewStyled>
      <ButtonStyled onPress={showAppReview}>
        <RateContainer>
          <MaterialIcons name={'star'} size={18} color={paperTheme.colors.primary} />
        </RateContainer>
        <TextStyled>Review OrangeQC</TextStyled>
      </ButtonStyled>
    </ViewStyled>
  );
};

export default ReviewOrangeButton;

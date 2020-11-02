import React, { useState } from 'react';
import { TextInput as NativeTextInput } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useMutation } from 'react-query';
import { AxiosResponse } from 'axios';
import { Formik } from 'formik';
import * as Yup from 'yup';

import ErrorMessage from 'src/components/ErrorMessage';
import { ScrollView } from 'src/components/KeyboardAware';
import ConnectionBanner from 'src/components/ConnectionBanner';
import { ApiError, UserResponse, authenticate } from 'src/services/api';
import { useUserSession } from 'src/contexts/userSession';
import config, { setEnv } from 'src/config';
import sensitiveStorage from 'src/utils/sensitiveStorage';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';

import { FormContainer } from './styles';
import StagingDialog from './StagingDialog';

interface Form {
  companyId: string;
  username: string;
  password: string;
}

const SignInSchema = Yup.object().shape({
  companyId: Yup.string().required(`Please enter your Account Name.`),
  username: Yup.string().required(`Please provide your Email/Username.`),
  password: Yup.string().required(`Please enter your password.`),
});

const authenticateError = 'Your username or password appears to be incorrect for this account';

const LoginScreen: React.FC<{}> = () => {
  const [isStaging, setStaging] = useState(config.isStaging);
  const [authError, setAuthError] = useState('');
  const [, dispatch] = useUserSession();

  const connected = useNetworkStatus();

  const [mutateSubmit, { isLoading }] = useMutation<AxiosResponse<UserResponse>, ApiError, Form>(authenticate, {
    onMutate: () => {
      setAuthError('');
    },
    onSuccess: async (userData) => {
      setAuthError('');

      if (userData.status === 200 && userData.data.user) {
        try {
          await sensitiveStorage.setItem('user', JSON.stringify(userData.data.user));
          await sensitiveStorage.setItem('isStaging', JSON.stringify(isStaging));
        } catch (err) {
          if (err?.message !== 'Network Error') {
            setAuthError(authenticateError);
          }
        }

        dispatch({ type: 'login', payload: userData.data.user });
      } else {
        setAuthError(authenticateError);
      }
    },
    onError: (err) => {
      if (err?.message !== 'Network Error') {
        setAuthError(err?.response?.data.message || authenticateError);
      }
    },
  });

  const handleEasterEgg = () => {
    if (!isLoading) {
      setAuthError('');

      if (isStaging) {
        setEnv(false);
        setStaging(false);
      } else {
        setEnv(true);
        setStaging(true);
      }
    }
  };

  const clearError = <T extends string | React.ChangeEvent<any>>(onChange: (e: T) => void) => {
    return (e: T) => {
      setAuthError('');
      onChange(e);
    };
  };

  return (
    <ScrollView>
      <ConnectionBanner connected={connected} />
      <Formik
        initialValues={{
          companyId: config.isDev ? 'mobiletest' : '',
          username: config.isDev ? 'diego' : '',
          password: config.isDev ? 'foxbox2020' : '',
        }}
        validationSchema={SignInSchema}
        onSubmit={(form) => mutateSubmit(form)}
      >
        {({ values, handleChange, errors, setFieldTouched, touched, isValid, handleSubmit }) => (
          <FormContainer>
            <TextInput
              value={values.companyId}
              onChangeText={clearError(handleChange('companyId'))}
              onBlur={() => setFieldTouched('companyId')}
              style={{ marginBottom: 10, textAlign: 'right' }}
              keyboardType="default"
              autoCapitalize="none"
              dense
              right={<TextInput.Affix text={`.${config.BACKEND_BASE_URL}`} />}
              /* @ts-ignore */
              render={(props) => <NativeTextInput {...props} textAlign="right" />}
              label="Account Name"
              disabled={isLoading}
              error={touched.companyId && !!errors.companyId}
            />
            {touched.companyId && errors.companyId && <ErrorMessage>{errors.companyId}</ErrorMessage>}
            <TextInput
              value={values.username}
              onChangeText={clearError(handleChange('username'))}
              onBlur={() => setFieldTouched('username')}
              style={{ marginBottom: 10 }}
              keyboardType="default"
              autoCapitalize="none"
              dense
              label="Email or Username"
              disabled={isLoading}
              error={touched.username && !!errors.username}
            />
            {touched.username && errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
            <TextInput
              value={values.password}
              onChangeText={clearError(handleChange('password'))}
              style={{ marginBottom: 10 }}
              keyboardType="default"
              autoCapitalize="none"
              dense
              autoCorrect={false}
              label="Password"
              onBlur={() => setFieldTouched('password')}
              secureTextEntry
              disabled={isLoading}
              onSubmitEditing={() => {
                if (isValid && !authError) {
                  handleSubmit();
                }
              }}
              error={(touched.password && !!errors.password) || !!authError}
            />
            {touched.password && (errors.password || !!authError) && (
              <ErrorMessage>{errors.password || authError}</ErrorMessage>
            )}
            <Button
              disabled={!isValid || !!authError || isLoading}
              onPress={handleSubmit}
              mode="contained"
              loading={isLoading}
              dark
              style={{ width: 120, alignSelf: 'flex-end', marginTop: 10 }}
            >
              Sign in
            </Button>
            <StagingDialog onConfirm={handleEasterEgg} />
          </FormContainer>
        )}
      </Formik>
    </ScrollView>
  );
};

export default LoginScreen;

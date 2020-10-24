import React, { useState } from 'react';
import { TextInput as NativeTextInput } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';

import ErrorMessage from 'src/components/ErrorMessage';
import { ScrollView } from 'src/components/KeyboardAware';
import { authenticate } from 'src/services/api';
import { useUserSession } from 'src/contexts/userSession';
import config from 'src/config';
import sensitiveStorage from 'src/utils/sensitiveStorage';

import { FormContainer } from './styles';

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
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [, dispatch] = useUserSession();

  const handleSubmit = async (values: Form) => {
    try {
      setLoading(true);
      setAuthError('');
      const { data, status } = await authenticate(values);
      if (status === 200 && data.user) {
        setLoading(false);
        await sensitiveStorage.setItem('user', JSON.stringify(data.user));
        dispatch({ type: 'login', payload: data.user });
      } else {
        setLoading(false);
        setAuthError(authenticateError);
      }
    } catch (err) {
      setAuthError(authenticateError);
      setLoading(false);
    }
  };

  const clearError = <T extends string | React.ChangeEvent<any>>(cb: (e: T) => void) => {
    return (e: T) => {
      setAuthError('');
      cb(e);
    };
  };

  return (
    <ScrollView>
      <Formik
        initialValues={{
          companyId: 'mobiletest',
          username: 'foxbox',
          password: 'foxbox2020',
        }}
        validationSchema={SignInSchema}
        onSubmit={handleSubmit}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={!isValid || !!authError || loading}
              onPress={handleSubmit}
              mode="contained"
              loading={loading}
              dark
              style={{ width: 120, alignSelf: 'flex-end', marginTop: 10 }}
            >
              Sign in
            </Button>
          </FormContainer>
        )}
      </Formik>
    </ScrollView>
  );
};

export default LoginScreen;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  useToast,
} from '@chakra-ui/react';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a new user with email and password
      const { user, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Send a confirmation email
      const { error: confirmationError } = await supabase.auth.sendMagicLinkEmail(user.email);

      if (confirmationError) {
        throw confirmationError;
      }

      toast({
        title: 'Account created',
        description: 'Please check your email for the confirmation link.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: 'Error creating account',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
<Box maxW="md" mx="auto" mt={8}>
      <Heading mb={6}>Sign Up</Heading>
      <form onSubmit={handleSignUp}>
        <Flex mb={4} align="center">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            mr={2}
          />
        </Flex>
        <Flex mb={4} align="center">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            mr={2}
          />
        </Flex>
        <Button
          colorScheme="blue"
          type="submit"
          isLoading={loading}
          loadingText="Creating account..."
        >
          Sign Up
        </Button>
      </form>
    </Box>
  );
};

export default SignUp;
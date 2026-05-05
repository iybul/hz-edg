import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  useToast,
  Text,
} from '@chakra-ui/react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error logging in:', error);
      toast({
        title: 'Error logging in',
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
    <Flex justify="center" align="center" h="100vh" bg="gray.100">
      <Box
        bg="white"
        p={8}
        borderRadius="md"
        boxShadow="md"
        maxW="md"
        w="full"
      >
        <Heading mb={6} textAlign="center">
          Login
        </Heading>
        <form onSubmit={handleLogin}>
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
            loadingText="Logging in..."
            width="full"
          >
            Login
          </Button>
        </form>
      </Box>
    </Flex>
  );
};

export default Login;
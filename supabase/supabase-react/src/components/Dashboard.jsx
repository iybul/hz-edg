import React, { useState } from 'react';
import { supabase } from '../supabaseClient.js';
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  useToast,
} from '@chakra-ui/react';

const DataEntryForm = () => {
  const [formData, setFormData] = useState({
    dateMade: '',
    employeeInitials: '',
    dateSold: '',
    lotCode: '',
    gallonsUsed: '',
    soldTo: '',
    batchSize: '',
    milkId: '',
    mm101_100Large: '',
    MM101_100: '',
    amountUsedPCABL: '',
    amountUsedGeo15_17: '',
    amountUsedMD89_MD88: '',
    amountUsed: '',
    smallMade: '',
    mediumMade: '',
    largeMade: '',
  });

  const toast = useToast();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const getFormData = async (e) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('data_entry').insert([formData]);
      if (error) throw error;
      


      setFormData({
        dateMade: '',
        employeeInitials: '',
        dateSold: '',
        lotCode: '',
        gallonsUsed: '',
        soldTo: '',
        batchSize: '',
        milkId: '',
        mm101_100Large: '',
        MM101_100: '',
        amountUsedPCABL: '',
        amountUsedGeo15_17: '',
        amountUsedMD89_MD88: '',
        amountUsed: '',
        smallMade: '',
        mediumMade: '',
        largeMade: '',
      });
      toast({
        title: 'Data submitted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error submitting data:', error);
      toast({
        title: 'Error submitting data',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8}>
      <Heading mb={6}>Data Entry Form</Heading>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((field) => (
          <Flex mb={4} key={field} align="center">
            <Input
              name={field}
              placeholder={field.replace(/([a-z])([A-Z])/g, '$1 $2')}
              value={formData[field]}
              onChange={handleInputChange}
              mr={2}
            />
          </Flex>
        ))}
        <Button colorScheme="blue" type="submit">
          Submit
        </Button>
      </form>
    </Box>
  );
};

export default DataEntryForm;
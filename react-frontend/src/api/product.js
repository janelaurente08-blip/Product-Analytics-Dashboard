
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Get all product query results for the dashboard.
export const getProductQueries = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/products/queries`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error(
      'Error fetching product queries:',
      error
    );

    throw error;
  }
};

// Get paginated products.
export const getProducts = async (page = 1) => {
  const response = await axios.get(
    `${API_BASE_URL}/products`,
    {
      params: { page },
      headers: {
        Accept: 'application/json',
      },
    }
  );

  return response.data.data;
};

// Get a single product by ID.
export const getProductById = async (id) => {
  const response = await axios.get(
    `${API_BASE_URL}/products/${id}`,
    {
      headers: {
        Accept: 'application/json',
      },
    }
  );

  return response.data.data;
};

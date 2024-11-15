import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://stageapi.monkcommerce.app/task/products/search";
const API_KEY = "72njgfa948d9aS7gs5";

// Load initial state from session storage
const loadInitialState = () => {
  try {
    const savedState = sessionStorage.getItem('productState');
    return savedState ? JSON.parse(savedState) : {
      items: [],
      selectedProducts: [],
      status: "idle",
      error: null,
      searchTerm: "",
    };
  } catch (error) {
    return {
      items: [],
      selectedProducts: [],
      status: "idle",
      error: null,
      searchTerm: "",
    };
  }
};

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ search = "" } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, {
        params: { search },
        headers: {
          "x-api-key": API_KEY,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: loadInitialState(),
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    updateProductAtIndex: (state, action) => {
      const { index, product } = action.payload;
      state.selectedProducts[index] = product;
      sessionStorage.setItem('productState', JSON.stringify(state));
    },
    setSelectedProducts: (state, action) => {
      state.selectedProducts = action.payload;
      sessionStorage.setItem('productState', JSON.stringify(state));
    },
    reorderVariants: (state, action) => {
      const { productIndex, variants } = action.payload;
      if (state.selectedProducts[productIndex]) {
        state.selectedProducts[productIndex].variants = variants;
        sessionStorage.setItem('productState', JSON.stringify(state));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { 
  setSearchTerm, 
  updateProductAtIndex, 
  setSelectedProducts,
  reorderVariants 
} = productsSlice.actions;

export default productsSlice.reducer;

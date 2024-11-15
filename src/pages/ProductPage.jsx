import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDispatch, useSelector } from "react-redux";
import logo from "../assets/monk.png";
import styles from "../styles/product.module.css";
import ProductList from "../components/ProductList";
import { 
  fetchProducts, 
  setSelectedProducts 
} from "../redux/features/productsSlice";

const ProductPage = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([0]);
  const { selectedProducts } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const addProductItem = () => {
    setProducts([...products, products.length]);
  };

  const moveItem = (dragIndex, hoverIndex) => {
    // Update products order
    const updatedProducts = [...products];
    const [draggedItem] = updatedProducts.splice(dragIndex, 1);
    updatedProducts.splice(hoverIndex, 0, draggedItem);
    setProducts(updatedProducts);

    // Update selected products order in Redux
    const updatedSelectedProducts = [...selectedProducts];
    const [draggedProduct] = updatedSelectedProducts.splice(dragIndex, 1);
    updatedSelectedProducts.splice(hoverIndex, 0, draggedProduct);
    dispatch(setSelectedProducts(updatedSelectedProducts));
  };

  const removeItem = (index) => {
    // Remove product from local state
    const updatedProducts = products.filter((_, idx) => idx !== index);
    setProducts(updatedProducts);

    // Remove product from Redux store
    const updatedSelectedProducts = selectedProducts.filter(
      (_, idx) => idx !== index
    );
    dispatch(setSelectedProducts(updatedSelectedProducts));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.mainContainer}>
        <img src={logo} alt="Monk" />
        <h1 className={styles.header}>Monk Upsell & Cross-sell</h1>
      </div>
      
      <div className={styles.addProductContainer}>
        <div className={styles.addProductsBox}>
          <h1 className={styles.title}>Add Products</h1>
          
          <div className={styles.titleDiv}>
            <p>Product</p>
            <p>Discount</p>
          </div>

          {products.map((_, index) => (
            <ProductList
              key={index}
              index={index}
              moveItem={moveItem}
              removeItem={removeItem}
            />
          ))}

          <button 
            className={styles.addProductBtn} 
            onClick={addProductItem}
          >
            Add Product
          </button>
        </div>
      </div>
    </DndProvider>
  );
};

export default ProductPage;

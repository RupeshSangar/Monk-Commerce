import { Checkbox, Input, Modal, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import closeIcon from "../assets/close.svg";
import styles from "../styles/productModal.module.css";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import logo from "../assets/monk.png";
import {
  fetchProducts,
  setSearchTerm,
  updateProductAtIndex,
} from "../redux/features/productsSlice";

const ProductPickerModal = ({ visible, onClose, index }) => {
  const dispatch = useDispatch();
  const { items, searchTerm, status, selectedProducts } = useSelector(
    (state) => state.products
  );
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});

  useEffect(() => {
    if (visible) {
      dispatch(fetchProducts({ search: searchTerm }));
      // Initialize with existing selections if any
      const currentProduct = selectedProducts[index];
      if (currentProduct) {
        setSelectedItems([currentProduct.id]);
        setSelectedVariants({
          [currentProduct.id]: currentProduct.selectedVariants || [],
        });
      }
    }
  }, [visible, dispatch, index, searchTerm, selectedProducts]);

  const handleSelectItem = (itemId) => {
    const item = items.find((item) => item.id === itemId);
    if (!item) return;

    if (selectedItems.includes(itemId)) {
      setSelectedItems([]);
      setSelectedVariants({});
    } else {
      setSelectedItems([itemId]);
      setSelectedVariants({
        [itemId]: item.variants?.map((v) => v.id) || [],
      });
    }
  };

  const handleSelectVariant = (itemId, variantId) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [itemId]: prev[itemId]?.includes(variantId)
        ? prev[itemId].filter((id) => id !== variantId)
        : [...(prev[itemId] || []), variantId],
    }));
  };

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
    dispatch(fetchProducts({ search: e.target.value }));
  };

  const handleSave = () => {
    const selectedProduct = items.find((item) => item.id === selectedItems[0]);
    if (selectedProduct) {
      const productWithVariants = {
        ...selectedProduct,
        selectedVariants: selectedVariants[selectedProduct.id] || [],
      };
      dispatch(updateProductAtIndex({ index, product: productWithVariants }));
    }
    onClose();
    setSelectedItems([]);
    setSelectedVariants({});
  };

  return (
    <Modal
      title={false}
      open={visible}
      onCancel={onClose}
      footer={false}
      closeIcon={false}
      centered
      width={600}
      maskClosable={false}
    >
      <div>
        <div className={styles.modalHeader}>
          <p>Select Products</p>
          <img src={closeIcon} alt="close icon" onClick={onClose} />
        </div>

        <div className={styles.modalSearchDiv}>
          <Input
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search product"
          />
        </div>

        <div className={styles.modalProductList}>
          {status === "loading" ? (
            <Spin indicator={<LoadingOutlined spin />} size="large" />
          ) : (
            items?.map((item) => (
              <div key={item.id} className={styles.productItem}>
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                >
                  <div className={styles.itemContent}>
                    <img
                      src={item.image?.src || logo}
                      alt={item.title}
                      className={styles.itemImage}
                      width={40}
                      height={40}
                    />
                    <span>{item.title}</span>
                  </div>
                </Checkbox>

                {selectedItems.includes(item.id) &&
                  item.variants?.length > 0 && (
                    <div className={styles.variantList}>
                      {item.variants.map((variant) => (
                        <div key={variant.id} className={styles.variantContent}>
                          <Checkbox
                            checked={selectedVariants[item.id]?.includes(
                              variant.id
                            )}
                            onChange={() =>
                              handleSelectVariant(item.id, variant.id)
                            }
                          >
                            <p>{variant.title}</p>
                          </Checkbox>
                          <p>${variant.price}</p>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))
          )}
        </div>

        <div className={styles.modalFooter}>
          <p className={styles.modalFooterText}>
            {selectedItems.length} product selected
          </p>
          <div className={styles.modalFooterButtonDiv}>
            <button
              className={styles.modalFooterButtonCancel}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className={styles.modalFooterButtonSave}
              onClick={handleSave}
              disabled={selectedItems.length === 0}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductPickerModal;

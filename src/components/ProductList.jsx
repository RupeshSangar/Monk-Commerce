import React, { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import styles from "../styles/product.module.css";
import icon from "../assets/doticon.svg";
import close from "../assets/close1.svg";
import editicon from "../assets/edit.svg";
import ProductPickerModal from "./ProductPickerModal";
import { useSelector, useDispatch } from "react-redux";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import {
  updateProductAtIndex,
} from "../redux/features/productsSlice";

const ProductList = ({ index, moveItem, removeItem }) => {
  const dispatch = useDispatch();
  const ref = useRef(null);
  const { selectedProducts } = useSelector((state) => state.products);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDiscountVisible, setIsDiscountVisible] = useState(false);
  const [discountValue, setDiscountValue] = useState("");
  const [discountType, setDiscountType] = useState("flat");
  const [isVariantsVisible, setIsVariantsVisible] = useState(false);

  const currentProduct = selectedProducts[index];

  const [{ isDragging }, drag] = useDrag({
    type: "productItem",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "productItem",
    hover: (item) => {
      if (item.index !== index) {
        moveItem(item.index, index);
        item.index = index;
      }
    },
  });

  drag(drop(ref));

  const handleDiscountToggle = () => {
    if (currentProduct) {
      setIsDiscountVisible(!isDiscountVisible);
    }
  };

  const handleDiscountChange = (e) => {
    setDiscountValue(e.target.value);
  };

  const handleDiscountTypeChange = (e) => {
    setDiscountType(e.target.value);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (currentProduct && currentProduct.selectedVariants) {
      const newVariants = Array.from(currentProduct.selectedVariants);
      const [removed] = newVariants.splice(sourceIndex, 1);
      newVariants.splice(destIndex, 0, removed);

      const updatedProduct = {
        ...currentProduct,
        selectedVariants: newVariants,
      };

      dispatch(updateProductAtIndex({ index, product: updatedProduct }));
    }
  };

  const removeVariant = (variantId) => {
    if (currentProduct && currentProduct.selectedVariants) {
      const updatedProduct = {
        ...currentProduct,
        selectedVariants: currentProduct.selectedVariants.filter(
          (id) => id !== variantId
        ),
      };
      dispatch(updateProductAtIndex({ index, product: updatedProduct }));
    }
  };

  return (
    <div className={styles.allProducts}>
      <div
        ref={ref}
        className={styles.productItem}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <span className={styles.dragHandle}>
          <img src={icon} alt="icon" />
        </span>
        <span className={styles.index}>{index + 1}.</span>
        <div className={styles.productInputWrapper}>
          <input
            className={styles.productInput}
            placeholder="Select Product"
            value={currentProduct?.title || ""}
            readOnly
            disabled
          />
          <span
            onClick={() => setIsModalVisible(true)}
            className={styles.editIcon}
          >
            <img src={editicon} alt="edit icon" />
          </span>
        </div>

        {!isDiscountVisible && (
          <button
            className={styles.addDiscountBtn}
            onClick={handleDiscountToggle}
            disabled={!currentProduct}
          >
            Add Discount
          </button>
        )}

        {isDiscountVisible && (
          <div className={styles.discountFields}>
            <input
              value={discountValue}
              onChange={handleDiscountChange}
              className={styles.discountInput}
            />
            <select
              value={discountType}
              onChange={handleDiscountTypeChange}
              className={styles.discountSelect}
            >
              <option value="flat">Flat Off</option>
              <option value="percentage">% Off</option>
            </select>
          </div>
        )}

        {index > 0 && (
          <img
            src={close}
            alt="close"
            onClick={() => removeItem(index)}
            className={styles.removeIcon}
          />
        )}

        <ProductPickerModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          index={index}
        />
      </div>

      {currentProduct?.variants &&
        currentProduct.selectedVariants?.length > 0 && (
          <div className={styles.productVariantDiv}>
            <button
              className={styles.showVariantsBtn}
              onClick={() => setIsVariantsVisible(!isVariantsVisible)}
            >
              {isVariantsVisible ? (
                <>
                  Hide Variants <UpOutlined />
                </>
              ) : (
                <>
                  Show Variants <DownOutlined />
                </>
              )}
            </button>

            {isVariantsVisible && (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={`variants-${currentProduct.id}`}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={styles.variantList}
                    >
                      {currentProduct.variants
                        .filter((variant) =>
                          currentProduct.selectedVariants.includes(variant.id)
                        )
                        .map((variant, idx) => (
                          <Draggable
                            key={variant.id.toString()}
                            draggableId={variant.id.toString()}
                            index={idx}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`${styles.variantItem} ${styles.productItem}`}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.5 : 1,
                                }}
                              >
                                <span className={styles.dragHandle}>
                                  <img src={icon} alt="icon" />
                                </span>
                                <div className={styles.productInputWrapper}>
                                  <input
                                    className={`${styles.variantsProductInput} ${styles.productInput}`}
                                    value={variant.title}
                                    readOnly
                                    disabled
                                  />
                                </div>
                                <div
                                  className={`${styles.variantsDiscountFields} ${styles.discountFields}`}
                                >
                                  <input
                                    className={`${styles.variantsDiscountInput} ${styles.discountInput}`}
                                  />
                                  <select
                                    className={`${styles.variantsDiscountSelect} ${styles.discountSelect}`}
                                  >
                                    <option value="flat">Flat Off</option>
                                    <option value="percentage">% Off</option>
                                  </select>
                                </div>
                                {currentProduct.selectedVariants.length > 1 && (
                                  <img
                                    src={close}
                                    alt="close"
                                    onClick={() => removeVariant(variant.id)}
                                    className={styles.removeIcon}
                                  />
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        )}
    </div>
  );
};

export default ProductList;

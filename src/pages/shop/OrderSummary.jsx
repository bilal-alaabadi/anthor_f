// components/OrderSummary.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../redux/features/cart/cartSlice';
import { Link } from 'react-router-dom';

const OrderSummary = ({ onClose }) => {
  const dispatch = useDispatch();

  const {
    products,
    totalPrice,
    shippingFee,
    country
  } = useSelector((store) => store.cart);

  const currency =
    country === 'الإمارات' ? 'د.إ' : 'ر.ع.';

  const exchangeRate =
    country === 'الإمارات' ? 9.5 : 1;

  const grandTotal =
    (totalPrice + shippingFee) * exchangeRate;

  const formattedTotalPrice =
    (totalPrice * exchangeRate).toFixed(2);

  const formattedShippingFee =
    (shippingFee * exchangeRate).toFixed(2);

  const formattedGrandTotal =
    grandTotal.toFixed(2);

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  // التحقق من أن كمية كل منتج في السلة لا تتجاوز المخزون
  const invalidProducts = products.filter((item) => {
    const requestedQuantity = Number(item.quantity || 0);
    const availableStock = Number(item.stock || 0);

    return (
      item.inStock === false ||
      availableStock <= 0 ||
      requestedQuantity > availableStock
    );
  });

  const canCheckout =
    products.length > 0 &&
    invalidProducts.length === 0;

  const handleCheckout = (e) => {
    if (!canCheckout) {
      e.preventDefault();
      e.stopPropagation();

      if (invalidProducts.length > 0) {
        const product = invalidProducts[0];

        const availableStock =
          Math.max(0, Number(product.stock || 0));

        alert(
          availableStock === 0
            ? `نفذت كمية المنتج: ${product.name}`
            : `الكمية المطلوبة من ${product.name} غير متوفرة. المتوفر فقط ${availableStock}`
        );
      }

      return;
    }

    if (onClose) {
      onClose();
    }
  };

  const renderCustomizationDetails = (item) => {
    if (!item.customization) return null;

    return (
      <div className="mt-2 text-sm text-gray-100">
        {item.customization.length && (
          <p>
            الطول: {item.customization.length} سم
          </p>
        )}

        {item.customization.width && (
          <p>
            العرض: {item.customization.width} سم
          </p>
        )}

        {item.customization.sleeveType && (
          <p>
            نوع الأكمام: {item.customization.sleeveType}
          </p>
        )}

        {item.customization.closureType && (
          <p>
            نوع الإغلاق: {item.customization.closureType}
          </p>
        )}

        {item.customization.color && (
          <p>
            اللون: {item.customization.color}
          </p>
        )}

        {item.customization.notes && (
          <p>
            ملاحظات: {item.customization.notes}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className='bg-[#758d64] mt-5 rounded text-base'>
      <div className='px-6 py-4 space-y-5'>

        <h2 className='text-xl text-white'>
          ملخص الطلب
        </h2>

        <div className="text-white space-y-4">

          {products.map((item, index) => {
            const requestedQuantity =
              Number(item.quantity || 0);

            const availableStock =
              Number(item.stock || 0);

            const quantityNotAvailable =
              item.inStock === false ||
              availableStock <= 0 ||
              requestedQuantity > availableStock;

            return (
              <div
                key={index}
                className="border-b pb-3"
              >

                <p>
                  {item.name} × {item.quantity}
                </p>

                {quantityNotAvailable && (
                  <p className="text-red-200 font-bold text-sm mt-1">
                    {availableStock <= 0
                      ? 'نفذت الكمية'
                      : `الكمية المتوفرة فقط: ${availableStock}`}
                  </p>
                )}

                {item.customization &&
                  renderCustomizationDetails(item)}

                <p className="text-sm mt-1">
                  السعر:{' '}
                  {(
                    item.price *
                    exchangeRate *
                    item.quantity
                  ).toFixed(2)}{' '}
                  {currency}
                </p>

              </div>
            );
          })}

        </div>

        <div className='text-white'>

          <p>
            السعر الفرعي: {formattedTotalPrice} {currency}
          </p>

          <p>
            رسوم الشحن: {formattedShippingFee} {currency}
          </p>

          <p className='font-bold mt-2'>
            الإجمالي النهائي: {formattedGrandTotal} {currency}
          </p>

        </div>

        <div className='px-4 mb-6'>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClearCart();
            }}
            className='bg-red-500 px-3 py-1.5 text-white mt-2 rounded-md flex justify-between items-center mb-4 hover:bg-red-600 transition-colors'
          >
            <span className='mr-2'>
              تفريغ السلة
            </span>

            <i className="ri-delete-bin-7-line"></i>
          </button>

          {canCheckout ? (
            <Link to="/checkout">
              <button
                onClick={handleCheckout}
                className='bg-green-600 px-3 py-1.5 text-white mt-2 rounded-md flex justify-between items-center hover:bg-green-700 transition-colors'
              >
                <span className='mr-2'>
                  إتمام الشراء
                </span>

                <i className="ri-bank-card-line"></i>
              </button>
            </Link>
          ) : (
            <button
              onClick={handleCheckout}
              className='bg-gray-400 px-3 py-1.5 text-white mt-2 rounded-md flex justify-between items-center cursor-not-allowed'
            >
              <span className='mr-2'>
                إتمام الشراء
              </span>

              <i className="ri-bank-card-line"></i>
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default OrderSummary;

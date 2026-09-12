import React from 'react';
import { RiCloseLine } from "react-icons/ri";
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart } from '../../redux/features/cart/cartSlice';
import OrderSummary from './OrderSummary';

const CartModal = ({ products, isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { totalPrice, country } = useSelector((state) => state.cart);

    // تحديد العملة ورسوم الشحن حسب الدولة
    const currency = country === 'الإمارات' ? 'د.إ' : 'ر.ع.';
    const exchangeRate = country === 'الإمارات' ? 9.5 : 1;
    const shippingFee = country === 'الإمارات' ? 4 : 2;

    const formatPrice = (price) => {
        return (price * exchangeRate).toFixed(2);
    };

    const handleIncrement = (product) => {
        const currentQuantity = Number(product.quantity || 0);
        const availableStock = Number(product.stock || 0);

        if (currentQuantity >= availableStock) {
            alert(`الكمية انتهت. المتوفر فقط ${availableStock} من ${product.name}`);
            return;
        }

        dispatch(
            updateQuantity({
                id: product._id,
                type: 'increment'
            })
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="bg-white w-full max-w-md h-full overflow-y-auto">

                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#4E5A3F]">
                        سلة التسوق
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <RiCloseLine size={24} />
                    </button>
                </div>

                <div className="p-4 space-y-4">

                    {products.length === 0 ? (
                        <p className="text-center py-8">
                            سلة التسوق فارغة
                        </p>
                    ) : (
                        <>
                            {products.map((product) => {
                                const availableStock = Number(product.stock || 0);
                                const currentQuantity = Number(product.quantity || 0);

                                const reachedMaxStock =
                                    availableStock <= 0 ||
                                    currentQuantity >= availableStock;

                                return (
                                    <div
                                        key={product._id}
                                        className="flex justify-between items-center border-b border-gray-100 py-4"
                                    >
                                        <div className="flex items-center gap-4">

                                            <img
                                                src={
                                                    Array.isArray(product.image)
                                                        ? product.image[0]
                                                        : product.image
                                                }
                                                alt={product.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />

                                            <div>
                                                <h3 className="font-medium">
                                                    {product.name}
                                                </h3>

                                                <p className="text-gray-600">
                                                    {formatPrice(product.price)} {currency}
                                                </p>

                                                <p className="text-xs text-gray-500 mt-1">
                                                    المتوفر: {availableStock}
                                                </p>

                                                {reachedMaxStock && (
                                                    <p className="text-xs text-red-500 font-bold mt-1">
                                                        الكمية انتهت
                                                    </p>
                                                )}
                                            </div>

                                        </div>

                                        <div className="flex items-center gap-2">

                                            <button
                                                onClick={() =>
                                                    dispatch(
                                                        updateQuantity({
                                                            id: product._id,
                                                            type: 'decrement'
                                                        })
                                                    )
                                                }
                                                className="w-8 h-8 flex items-center justify-center border rounded"
                                            >
                                                -
                                            </button>

                                            <span>
                                                {product.quantity}
                                            </span>

                                            <button
                                                onClick={() => handleIncrement(product)}
                                                disabled={reachedMaxStock}
                                                className={`w-8 h-8 flex items-center justify-center border rounded ${
                                                    reachedMaxStock
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'hover:bg-gray-100'
                                                }`}
                                            >
                                                +
                                            </button>

                                            <button
                                                onClick={() =>
                                                    dispatch(
                                                        removeFromCart({
                                                            id: product._id
                                                        })
                                                    )
                                                }
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <RiCloseLine size={18} />
                                            </button>

                                        </div>
                                    </div>
                                );
                            })}

                            {/* <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between py-2">
                                    <span>رسوم الشحن</span>
                                    <span>{formatPrice(shippingFee)} {currency}</span>
                                </div>
                                <div className="flex justify-between py-2 font-bold">
                                    <span>الإجمالي</span>
                                    <span>{formatPrice(totalPrice + shippingFee)} {currency}</span>
                                </div>
                            </div> */}

                            {products.length > 0 && (
                                <OrderSummary onClose={onClose} />
                            )}
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CartModal;

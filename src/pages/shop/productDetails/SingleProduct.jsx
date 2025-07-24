import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchProductByIdQuery } from '../../../redux/features/products/productsApi';
import { addToCart } from '../../../redux/features/cart/cartSlice';
import ReviewsCard from '../reviews/ReviewsCard';

const SingleProduct = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { data, error, isLoading } = useFetchProductByIdQuery(id);

    const singleProduct = data?.product || {};
    const productReviews = data?.reviews || [];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleAddToCart = (product) => {
        if (!user) {
            navigate('/login');
            return;
        }
        dispatch(addToCart(product));
    };

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === singleProduct.image.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? singleProduct.image.length - 1 : prevIndex - 1
        );
    };

    if (isLoading) return <p>جاري التحميل...</p>;
    if (error) return <p>حدث خطأ أثناء تحميل تفاصيل المنتج.</p>;

    return (
        <div dir="rtl">
            {/* Breadcrumb Section */}
<section className='section__container bg-[#FAEBD7]'>
                <h2 className='section__header capitalize'>صفحة المنتج الفردي</h2>
                <div className='section__subheader space-x-2'>
                    <span className='hover:text-primary'><Link to="/">الرئيسية</Link></span>
                    <i className="ri-arrow-right-s-line"></i>
                    <span className='hover:text-primary'><Link to="/shop">المتجر</Link></span>
                    <i className="ri-arrow-right-s-line"></i>
                    <span className='hover:text-primary'>{singleProduct.name}</span>
                </div>
            </section>

            {/* Product Section */}
            <section className='max-w-6xl mx-auto py-8 px-4'>
                <div className='flex flex-col md:flex-row gap-8 bg-white p-6 rounded-lg shadow-md'>
                    {/* Image Gallery */}
                    <div className='md:w-1/2 relative'>
                        {singleProduct.image?.length > 0 ? (
                            <div className="relative h-64 md:h-96 overflow-hidden rounded-lg">
                                <img
                                    src={singleProduct.image[currentImageIndex]}
                                    alt={singleProduct.name}
                                    className='w-full h-full object-cover transition-opacity duration-300'
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/500";
                                        e.target.alt = "صورة غير متوفرة";
                                    }}
                                />
                                
                                {singleProduct.image.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full shadow-md hover:bg-white transition-all'
                                        >
                                            <i className="ri-arrow-right-line"></i>
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full shadow-md hover:bg-white transition-all'
                                        >
                                            <i className="ri-arrow-left-line"></i>
                                        </button>
                                        
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                            {singleProduct.image.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`w-3 h-3 rounded-full transition-all ${
                                                        index === currentImageIndex ? 'bg-[#d3ae27] w-6' : 'bg-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="h-64 md:h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                                <p className="text-gray-500">لا توجد صور متاحة</p>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className='md:w-1/2'>
                        <h3 className='text-2xl font-bold text-gray-800 mb-4'>{singleProduct.name}</h3>
                        
                        <div className="mb-4">
                            <span className="text-2xl text-[#d3ae27] font-bold">
                                {singleProduct.price} ر.ع
                            </span>
                            {singleProduct.oldPrice && (
                                <span className="text-gray-400 line-through mr-2">
                                    {singleProduct.oldPrice} ر.ع
                                </span>
                            )}
                        </div>
                        
                        
                        <div className="mb-6">
                            <h4 className="text-lg font-bold text-gray-800 mb-2">الفئة</h4>
                            <p className="text-gray-600">{singleProduct.category}</p>
                        </div>
                        <div className="mb-6">
                            <h4 className="text-lg font-bold text-gray-800 mb-2">وصف المنتج</h4>
                            <p className="text-gray-600">{singleProduct.description}</p>
                        </div>
                        
                        <button
                            onClick={() => handleAddToCart(singleProduct)}
                            className="px-6 py-3 bg-[#3D4B2E] hover:bg-[#c19e22] text-white font-medium rounded-lg transition-colors shadow-md"
                        >
                            إضافة إلى السلة
                        </button>
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section className='max-w-6xl mx-auto py-8 px-4'>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <ReviewsCard productReviews={productReviews} />
                </div>
            </section>
        </div>
    );
};

export default SingleProduct;
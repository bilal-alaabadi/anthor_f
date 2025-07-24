import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RatingStars from '../../components/RatingStars';
import { useFetchAllProductsQuery } from '../../redux/features/products/productsApi';

const TrendingProducts = () => {
    const [visibleProducts, setVisibleProducts] = useState(4);
    const [hoveredProducts, setHoveredProducts] = useState({});

    const { data: { products = [] } = {}, error, isLoading } = useFetchAllProductsQuery({
        category: '',
        page: 1,
        limit: 20,
    });

    const loadMoreProducts = () => {
        setVisibleProducts((prevCount) => prevCount + 4);
    };

    const handleMouseEnter = (productId) => {
        setHoveredProducts(prev => ({
            ...prev,
            [productId]: true
        }));
    };

    const handleMouseLeave = (productId) => {
        setHoveredProducts(prev => ({
            ...prev,
            [productId]: false
        }));
    };

    const getFirstPrice = (product) => {
        if (!product) return 0;
        
        if (product.category === 'حناء بودر' && product.price && typeof product.price === 'object') {
            return product.price['500 جرام'] || product.price['1 كيلو'] || 0;
        }
        
        return product.regularPrice || product.price || 0;
    };

    if (isLoading) {
        return <div className="text-center py-8">جاري التحميل...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">حدث خطأ أثناء جلب البيانات.</div>;
    }

    return (
        <section className="section__container product__container">
            <h2 className="section__header text-3xl font-bold text-[#e2e5e5] mb-4">
                منتجات جديدة
            </h2>
<p className="section__subheader text-lg text-gray-600 mb-12" dir='rtl'>
    عِش تجربة فاخرة من الروائح الشرقية الأصيلة مع تشكيلتنا المختارة من العطور التقليدية والأنثور الطبيعي.
</p>


            <div className="mt-12" dir='rtl'>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {products.slice(0, visibleProducts).map((product) => (
                        <div key={product._id} className="product__card bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="relative">
                                <Link to={`/shop/${product._id}`}>
                                    <div 
                                        className="aspect-square overflow-hidden"
                                        onMouseEnter={() => handleMouseEnter(product._id)}
                                        onMouseLeave={() => handleMouseLeave(product._id)}
                                    >
                                        <img
                                            src={
                                                hoveredProducts[product._id] && product.image?.[1] 
                                                    ? product.image[1] 
                                                    : product.image?.[0] || "https://via.placeholder.com/300"
                                            }
                                            alt={product.name || "صورة المنتج"}
                                            className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/300";
                                                e.target.alt = "Image not found";
                                            }}
                                        />
                                    </div>
                                </Link>
                            </div>

                            <div className="p-4 text-center">
                                <h4 className="text-lg font-semibold">{product.name || "اسم المنتج"}</h4>
                                <p className="text-gray-500 text-sm mb-2">{product.category || "فئة غير محددة"}</p>
                                
                                <div className="text-[#d3ae27] mt-2 font-medium">
                                    {getFirstPrice(product)} ر.ع
                                    {product.oldPrice && (
                                        <s className="text-gray-500 text-sm ml-2">{product.oldPrice} ر.ع</s>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {visibleProducts < products.length && (
                <div className="product__btn text-center mt-8" dir='rtl'>
                    <button 
                        className="btn bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
                        onClick={loadMoreProducts}
                    >
                        عرض المزيد
                    </button>
                </div>
            )}
        </section>
    );
};

export default TrendingProducts;
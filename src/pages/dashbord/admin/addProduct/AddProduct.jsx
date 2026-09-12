import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import UploadImage from './UploadImage';
import { useAddProductMutation } from '../../../../redux/features/products/productsApi';
import { useNavigate } from 'react-router-dom';

// ===== التصنيفات الجديدة فقط =====
const categories = [
    { label: 'أختر منتج', value: '' },
    { label: 'عطور', value: 'عطور' },
    { label: 'معطرات الجسم', value: 'معطرات الجسم' },
    { label: 'معطر الجو', value: 'معطر الجو' },
    { label: 'عصي العتم', value: 'عصي العتم' }
];
const AddProduct = () => {
  const { user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    oldPrice: '',
    inStock: true, // متوفر افتراضياً
    stock: '',     // ✅ جديد: كمية المخزون
  });

  const [image, setImage] = useState([]);

  const [addProduct, { isLoading }] = useAddProductMutation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'ended' && type === 'checkbox') {
      // إذا تم التأشير على "هل انتهى المنتج؟" = نعم → inStock = false
      setProduct((prev) => ({ ...prev, inStock: !checked }));
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = {
      'أسم المنتج': product.name,
      'صنف المنتج': product.category,
      'السعر': product.price,
      'الكمية في المخزون': product.stock,   // ✅ تحقق من الكمية
      'الوصف': product.description,
      'الصور': image.length > 0,
    };

    const missing = Object.entries(required)
      .filter(([, v]) => !v && v !== 0)
      .map(([k]) => k);

    if (missing.length) {
      alert(`الرجاء ملء الحقول التالية: ${missing.join('، ')}`);
      return;
    }

    const stockNum = Number(product.stock);
    if (!Number.isFinite(stockNum) || stockNum < 0) {
      alert('الكمية في المخزون يجب أن تكون رقمًا 0 أو أكبر');
      return;
    }

    const priceNum = Number(product.price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      alert('السعر غير صالح');
      return;
    }

    try {
      await addProduct({
        ...product,
        price: priceNum,
        stock: stockNum,          // ✅ إرسال الكمية كرقم
        oldPrice: product.oldPrice === '' ? undefined : Number(product.oldPrice),
        image,
        author: user?._id,
      }).unwrap();

      alert('تمت أضافة المنتج بنجاح');
      setProduct({
        name: '',
        category: '',
        oldPrice: '',
        price: '',
        description: '',
        inStock: true,
        stock: '', // إعادة التعيين
      });
      setImage([]);
      navigate('/shop');
    } catch (err) {
      console.error('Failed to submit product', err);
      alert('حدث خطأ أثناء إضافة المنتج');
    }
  };

  return (
    <div className="container mx-auto mt-8" dir="rtl">
      <h2 className="text-2xl font-bold mb-6">أضافة منتج جديد</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="أسم المنتج"
          name="name"
          placeholder="أكتب أسم المنتج"
          value={product.name}
          onChange={handleChange}
        />

        <SelectInput
          label="صنف المنتج"
          name="category"
          value={product.category}
          onChange={handleChange}
          options={categories}
        />

        <TextInput
          label="السعر القديم (اختياري)"
          name="oldPrice"
          type="number"
          placeholder="100"
          value={product.oldPrice}
          onChange={handleChange}
        />

        <TextInput
          label="السعر"
          name="price"
          type="number"
          placeholder="50"
          value={product.price}
          onChange={handleChange}
        />

        {/* ✅ جديد: كمية المخزون */}
        <TextInput
          label="الكمية في المخزون"
          name="stock"
          type="number"
          placeholder="0"
          value={product.stock}
          onChange={handleChange}
        />

        {/* هل انتهى المنتج؟ (إذا تم التأشير = لا يمكن إضافته للسلة) */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ended"
            name="ended"
            checked={!product.inStock}
            onChange={handleChange}
          />
          <label htmlFor="ended">هل انتهى المنتج؟</label>
        </div>

        <UploadImage
          name="image"
          id="image"
          uploaded={image}
          setImage={setImage}
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            وصف المنتج
          </label>
          <textarea
            name="description"
            id="description"
            className="add-product-InputCSS"
            value={product.description}
            placeholder="اكتب وصف المنتج"
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div>
          <button type="submit" className="add-product-btn" disabled={isLoading}>
            {isLoading ? 'جاري الإضافة...' : 'أضف منتج'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;

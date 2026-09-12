import React, {
  useState,
  useEffect
} from 'react';

import {
  useNavigate,
  useParams
} from 'react-router-dom';

import {
  useFetchProductByIdQuery,
  useUpdateProductMutation
} from '../../../../redux/features/products/productsApi';

import { useSelector } from 'react-redux';

import TextInput from '../addProduct/TextInput';
import SelectInput from '../addProduct/SelectInput';

import UploadImage from '../manageProduct/UploadImag';

const categories = [
  {
    label: 'أختر منتج',
    value: ''
  },
  {
    label: 'عطور',
    value: 'عطور'
  },
  {
    label: 'معطرات الجسم',
    value: 'معطرات الجسم'
  },
  {
    label: 'معطر الجو',
    value: 'معطر الجو'
  },
  {
    label: 'عصي العتم',
    value: 'عصي العتم'
  }
];

const UpdateProduct = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  const { user } = useSelector(
    (state) => state.auth
  );

  const {
    data: productData,
    isLoading: isFetching,
    error: fetchError
  } = useFetchProductByIdQuery(id);

  const [
    updateProduct,
    { isLoading: isUpdating }
  ] = useUpdateProductMutation();

  const [product, setProduct] =
    useState({
      name: '',
      category: '',
      price: '',
      oldPrice: '',
      description: '',
      image: [],
      inStock: true,
      stock: '',
    });

  const [newImages, setNewImages] =
    useState([]);

  const [keepImages, setKeepImages] =
    useState([]);

  useEffect(() => {

    if (!productData) return;

    const p = productData.product
      ? productData.product
      : productData;

    const currentImages =
      Array.isArray(p?.image)
        ? p.image
        : p?.image
        ? [p.image]
        : [];

    setProduct({
      name: p?.name || '',
      category: p?.category || '',

      price:
        p?.price != null
          ? String(p.price)
          : '',

      oldPrice:
        p?.oldPrice != null
          ? String(p.oldPrice)
          : '',

      description:
        p?.description || '',

      image: currentImages,

      inStock:
        typeof p?.inStock === 'boolean'
          ? p.inStock
          : true,

      stock:
        p?.stock != null
          ? String(p.stock)
          : '',
    });

    setKeepImages(currentImages);

  }, [productData]);

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setProduct((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const incStock = () => {

    setProduct((prev) => {

      const curr = Math.max(
        0,
        Number(prev.stock || 0)
      );

      return {
        ...prev,
        stock: String(curr + 1)
      };
    });
  };

  const decStock = () => {

    setProduct((prev) => {

      const curr = Math.max(
        0,
        Number(prev.stock || 0)
      );

      return {
        ...prev,
        stock: String(
          Math.max(0, curr - 1)
        )
      };
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const required = {
      'أسم المنتج': product.name,
      'صنف المنتج': product.category,
      'السعر': product.price,
      'الوصف': product.description,
    };

    const missing =
      Object.entries(required)
        .filter(([, v]) => !v)
        .map(([k]) => k);

    if (missing.length) {

      return alert(
        `الرجاء ملء الحقول التالية: ${missing.join('، ')}`
      );
    }

    const stockNum =
      Number(product.stock);

    if (
      !Number.isFinite(stockNum) ||
      stockNum < 0
    ) {
      alert(
        'كمية المخزون يجب أن تكون رقمًا 0 أو أكبر'
      );

      return;
    }

    try {

      const formData =
        new FormData();

      formData.append(
        'name',
        product.name
      );

      formData.append(
        'category',
        product.category
      );

      formData.append(
        'price',
        product.price
      );

      formData.append(
        'oldPrice',
        product.oldPrice || ''
      );

      formData.append(
        'description',
        product.description
      );

      formData.append(
        'author',
        user?._id || ''
      );

      formData.append(
        'inStock',
        String(product.inStock)
      );

      // ✅ إرسال stock
      formData.append(
        'stock',
        String(
          Math.max(
            0,
            Number(product.stock)
          )
        )
      );

      formData.append(
        'keepImages',
        JSON.stringify(
          keepImages || []
        )
      );

      newImages.forEach((f) =>
        formData.append(
          'image',
          f
        )
      );

      await updateProduct({
        id,
        body: formData
      }).unwrap();

      alert(
        'تم تحديث المنتج بنجاح'
      );

      navigate(
        '/dashboard/manage-products'
      );

    } catch (error) {

      alert(
        'حدث خطأ أثناء تحديث المنتج: ' +
        (
          error?.data?.message ||
          error?.message ||
          'خطأ غير معروف'
        )
      );
    }
  };

  if (isFetching) {

    return (
      <div className="text-center py-8">
        جاري تحميل بيانات المنتج...
      </div>
    );
  }

  if (fetchError) {

    return (
      <div className="text-center py-8 text-red-500">
        خطأ في تحميل بيانات المنتج
      </div>
    );
  }

  return (

    <div
      className="container mx-auto mt-8 px-4"
      dir="rtl"
    >

      <h2 className="text-2xl font-bold mb-6 text-right">
        تحديث المنتج
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        <TextInput
          label="اسم المنتج"
          name="name"
          placeholder="أكتب اسم المنتج"
          value={product.name}
          onChange={handleChange}
          required
        />

        <SelectInput
          label="صنف المنتج"
          name="category"
          value={product.category}
          onChange={handleChange}
          options={categories}
          required
        />

        <TextInput
          label="السعر الحالي"
          name="price"
          type="number"
          placeholder="50"
          value={product.price}
          onChange={handleChange}
          required
        />

        <TextInput
          label="السعر القديم (اختياري)"
          name="oldPrice"
          type="number"
          placeholder="100"
          value={product.oldPrice}
          onChange={handleChange}
        />

        <div className="flex items-end gap-3">

          <div className="flex-1">

            <label className="block text-sm font-medium text-gray-700 mb-1">
              المخزون (عدد القطع)
            </label>

            <input
              type="number"
              min={0}
              name="stock"
              value={product.stock}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              placeholder="0"
            />

          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={decStock}
              className="px-3 py-2 border rounded-md hover:bg-gray-50"
              aria-label="إنقاص المخزون"
            >
              −
            </button>

            <button
              type="button"
              onClick={incStock}
              className="px-3 py-2 border rounded-md hover:bg-gray-50"
              aria-label="زيادة المخزون"
            >
              +
            </button>

          </div>

        </div>

        <UploadImage
          name="image"
          id="image"
          initialImages={product.image}
          setImages={setNewImages}
          setKeepImages={setKeepImages}
        />

        <div className="text-right">

          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            وصف المنتج
          </label>

          <textarea
            name="description"
            id="description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            value={product.description}
            placeholder="أكتب وصف المنتج"
            onChange={handleChange}
            required
            rows={4}
          />

        </div>

        <div className="flex items-center gap-6">

          <label className="flex items-center gap-2">

            <input
              type="radio"
              name="availability"
              value="available"
              checked={
                product.inStock === true
              }
              onChange={() =>
                setProduct((prev) => ({
                  ...prev,
                  inStock: true
                }))
              }
            />

            <span>
              المنتج متوفر
            </span>

          </label>

          <label className="flex items-center gap-2">

            <input
              type="radio"
              name="availability"
              value="ended"
              checked={
                product.inStock === false
              }
              onChange={() =>
                setProduct((prev) => ({
                  ...prev,
                  inStock: false
                }))
              }
            />

            <span>
              انتهى المنتج
            </span>

          </label>

        </div>

        <div className="flex justify-end pt-4">

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isUpdating}
          >

            {isUpdating
              ? 'جاري التحديث...'
              : 'حفظ التغييرات'}

          </button>

        </div>

      </form>

    </div>
  );
};

export default UpdateProduct;

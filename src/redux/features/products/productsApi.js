import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseUrl } from "../../../utils/baseURL";

const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/products`,
    credentials: "include",
  }),
  tagTypes: ["Product", "ProductList"],
  endpoints: (builder) => ({
    fetchAllProducts: builder.query({
      query: ({
        category,
        gender,
        minPrice,
        maxPrice,
        search,
        sort = "createdAt:desc",
        page = 1,
        limit = 10,
      }) => {
        const params = {
          page: page.toString(),
          limit: limit.toString(),
          sort,
        };

        if (category && category !== "الكل") params.category = category;
        if (gender) params.gender = gender;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (search) params.search = search;

        const queryParams = new URLSearchParams(params).toString();
        return `/?${queryParams}`;
      },
      transformResponse: (response) => ({
        products: response.products,
        totalPages: response.totalPages,
        totalProducts: response.totalProducts,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ _id }) => ({ type: "Product", id: _id })),
              "ProductList",
            ]
          : ["ProductList"],
    }),

    // ▼▼▼ التعديل هنا: لا نرمي خطأ داخل transformResponse ▼▼▼
    fetchProductById: builder.query({
      query: (id) => `/product/${id}`,
      transformResponse: (response) => {
        const p = response?.product;
        // ارجع جسم آمن وثابت حتى لو المنتج غير موجود
        if (!p) {
          return {
            _id: null,
            notFound: true,
            name: "",
            category: "",
            size: "",
            price: 0,
            oldPrice: null,
            description: "",
            image: [],
            author: "",
            inStock: false,
            stock: 0,
            rating: 0,
          };
        }
        return {
          _id: p._id,
          name: p.name,
          category: p.category,
          size: p.size || "",
          price: p.price,
          oldPrice: p.oldPrice ?? null,
          description: p.description,
          image: Array.isArray(p.image) ? p.image : p.image ? [p.image] : [],
          author: p.author,
          inStock: typeof p.inStock === "boolean" ? p.inStock : true,
          stock: Number(p.stock ?? 0),
          rating: p.rating ?? 0,
        };
      },
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    // ▲▲▲ انتهى التعديل ▲▲▲

    fetchRelatedProducts: builder.query({
      query: (id) => `/related/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }, "ProductList"],
    }),

    addProduct: builder.mutation({
      query: (newProduct) => ({
        url: "/create-product",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["ProductList"],
    }),

    updateProduct: builder.mutation({
      query: ({ id, body }) => ({
        url: `/update-product/${id}`,
        method: "PATCH",
        body,
        credentials: "include",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }, "ProductList"],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Product", id }, "ProductList"],
    }),

    searchProducts: builder.query({
      query: (searchTerm) => `/search?q=${encodeURIComponent(searchTerm)}`,
      transformResponse: (response) => {
        return response.map((product) => ({
          ...product,
          price: product.category === "حناء بودر" ? product.price : product.regularPrice,
          images: Array.isArray(product.image) ? product.image : [product.image],
        }));
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: "Product", id: _id })), "ProductList"]
          : ["ProductList"],
    }),

    fetchBestSellingProducts: builder.query({
      query: (limit = 4) => `/best-selling?limit=${limit}`,
      providesTags: ["ProductList"],
    }),
  }),
});

export const {
  useFetchAllProductsQuery,
  useLazyFetchAllProductsQuery,
  useFetchProductByIdQuery,
  useLazyFetchProductByIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useFetchRelatedProductsQuery,
  useSearchProductsQuery,
  useLazySearchProductsQuery,
  useFetchBestSellingProductsQuery,
} = productsApi;

export default productsApi;

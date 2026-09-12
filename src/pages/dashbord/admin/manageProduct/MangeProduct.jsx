import React, { useState } from 'react'; 
import { Link } from 'react-router-dom'; 
import { useDeleteProductMutation, useFetchAllProductsQuery } from '../../../../redux/features/products/productsApi'; 
 
const ManageProduct = () => { 
    const [currentPage, setCurrentPage] = useState(1); 
    const [productsPerPage] = useState(12); 
    const {  
        data: { products = [], totalPages = 1, totalProducts = 0 } = {},  
        isLoading,  
        error,  
        refetch  
    } = useFetchAllProductsQuery({ 
        category: '', 
        minPrice: '', 
        maxPrice: '', 
        page: currentPage, 
        limit: productsPerPage, 
    }); 
 
    const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation(); 
 
    const startProduct = (currentPage - 1) * productsPerPage + 1; 
    const endProduct = Math.min(startProduct + productsPerPage - 1, totalProducts); 
 
    const handlePageChange = (pageNumber) => { 
        if (pageNumber > 0 && pageNumber <= totalPages) { 
            setCurrentPage(pageNumber); 
        } 
    }; 
 
    const getProductPrice = (product) => { 
        if (product.regularPrice) return `${product.regularPrice} ر.س`; 
         
        if (!product.price) return 'N/A'; 
         
        if (typeof product.price === 'object') { 
            const prices = []; 
            if (product.price['500 جرام']) prices.push(`${product.price['500 جرام']} ر.س (500 جرام)`); 
            if (product.price['1 كيلو']) prices.push(`${product.price['1 كيلو']} ر.س (1 كيلو)`); 
            if (product.price.default) prices.push(`${product.price.default} ر.س`); 
             
            return prices.join(' - ') || 'N/A'; 
        } 
         
        return `${product.price} ر.س`; 
    }; 
 
    const handleDeleteProduct = async (id) => { 
        const confirmDelete = window.confirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟"); 
        if (!confirmDelete) return; 
         
        try { 
            await deleteProduct(id).unwrap(); 
            alert("تم حذف المنتج بنجاح"); 
            if (products.length === 1 && currentPage > 1) { 
                setCurrentPage(currentPage - 1); 
            } else { 
                refetch(); 
            } 
        } catch (error) { 
            console.error("خطأ في حذف المنتج", error); 
            alert("فشل في حذف المنتج"); 
        } 
    }; 
 
    return ( 
    <div className="mx-auto p-2 md:p-4 w-full"> 
      <div className="bg-white rounded-lg shadow-md p-3 md:p-6 w-full"> 
        {/* Header Section */} 
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 w-full"> 
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 w-full md:w-auto text-center md:text-right"> 
            إدارة المنتجات 
          </h2> 
          <div className="w-full md:w-auto mt-2 md:mt-0 flex justify-center md:justify-end"> 
            <span className="text-xs md:text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full"> 
              عرض {startProduct}-{endProduct} من {totalProducts} منتج 
            </span> 
          </div> 
        </div> 
 
        {/* Loading/Error States */} 
        {isLoading ? ( 
          <div className="text-center py-8">جاري تحميل المنتجات...</div> 
        ) : error ? ( 
          <div className="text-center py-8 text-red-500">حدث خطأ أثناء تحميل المنتجات</div> 
        ) : ( 
          <> 
            {/* Mobile View - Full Width Cards */} 
            <div className="md:hidden space-y-3 w-full"> 
              {products.map((product, index) => ( 
                <div key={product._id} className="border rounded-lg p-3 shadow-sm w-full"> 
                  <div className="grid grid-cols-3 gap-2 items-center"> 
                    <div className="col-span-2"> 
                      <p className="font-medium text-gray-900 text-sm truncate"> 
                        {startProduct + index}. {product.name} 
                      </p> 
                      <p className="text-xs text-gray-500 mt-1">{product.category}</p>

                      <p
                        className={`text-xs mt-1 font-medium ${
                          Number(product.stock || 0) < 4
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        الكمية: {Number(product.stock || 0)}
                      </p>
                    </div> 
                    <div className="text-right"> 
                      <p className="text-sm font-medium">{getProductPrice(product)}</p> 
                    </div> 
                  </div> 
                   
                  <div className="mt-2 flex justify-end space-x-2"> 
                    <Link 
                      to={`/dashboard/update-product/${product._id}`} 
                      className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-200 rounded" 
                    > 
                      تعديل 
                    </Link> 
                    <button 
                      onClick={() => handleDeleteProduct(product._id)} 
                      disabled={isDeleting} 
                      className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-200 rounded" 
                    > 
                      {isDeleting ? 'جاري الحذف...' : 'حذف'} 
                    </button> 
                  </div> 
                </div> 
              ))} 
            </div> 
 
            {/* Desktop View - Full Width Table */} 
            <div className="hidden md:block w-full overflow-x-auto"> 
              <table className="min-w-full divide-y divide-gray-200"> 
                <thead className="bg-gray-50"> 
                  <tr> 
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th> 
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم المنتج</th> 
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الصنف</th> 
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الكمية
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">الإجراءات</th> 
                  </tr> 
                </thead> 
                <tbody className="bg-white divide-y divide-gray-200"> 
                  {products.map((product, index) => ( 
                    <tr key={product._id}> 
                      <td className="px-4 py-3 text-xs text-gray-500 text-center"> 
                        {startProduct + index} 
                      </td> 
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate"> 
                        {product.name} 
                      </td> 
                      <td className="px-4 py-3 text-xs text-gray-500"> 
                        {product.category} 
                      </td> 
                      <td className="px-4 py-3 text-sm text-gray-500"> 
                        {getProductPrice(product)} 
                      </td>

                      <td
                        className={`px-4 py-3 text-sm font-bold text-center ${
                          Number(product.stock || 0) < 4
                            ? 'text-red-600'
                            : 'text-gray-700'
                        }`}
                      >
                        {Number(product.stock || 0)}
                      </td>

                      <td className="px-4 py-3 text-sm font-medium flex justify-center space-x-2"> 
                        <Link 
                          to={`/dashboard/update-product/${product._id}`} 
                          className="text-blue-600 hover:text-blue-900 text-xs px-3 py-1 border border-blue-200 rounded" 
                        > 
                          تعديل 
                        </Link> 
                        <button 
                          onClick={() => handleDeleteProduct(product._id)} 
                          disabled={isDeleting} 
                          className="text-red-600 hover:text-red-900 text-xs px-3 py-1 border border-red-200 rounded" 
                        > 
                          {isDeleting ? 'جاري الحذف...' : 'حذف'} 
                        </button> 
                      </td> 
                    </tr> 
                  ))} 
                </tbody> 
              </table> 
            </div> 
 
            {/* Pagination - Full Width */} 
            {totalPages > 1 && ( 
              <div className="mt-4 md:mt-6 w-full overflow-x-auto"> 
                <div className="flex justify-center min-w-max"> 
                  <nav className="inline-flex rounded-md shadow"> 
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)} 
                      disabled={currentPage === 1} 
                      className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50" 
                    > 
                      السابق 
                    </button> 
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => ( 
                      <button 
                        key={page} 
                        onClick={() => handlePageChange(page)} 
                        className={`px-3 py-1 border-t border-b border-gray-300 text-xs md:text-sm font-medium ${ 
                          currentPage === page  
                            ? 'bg-blue-500 text-white'  
                            : 'bg-white text-gray-700 hover:bg-gray-50' 
                        }`} 
                      > 
                        {page} 
                      </button> 
                    ))} 
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      disabled={currentPage === totalPages} 
                      className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50" 
                    > 
                      التالي 
                    </button> 
                  </nav> 
                </div> 
              </div> 
            )} 
          </> 
        )} 
      </div> 
    </div> 
    ); 
}; 
 
export default ManageProduct;

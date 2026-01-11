import { Link } from 'react-router-dom'; 
 
 const NotFound = () => { 
   return ( 
     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4"> 
       <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1> 
       <p className="text-lg text-gray-600 mb-8">页面不存在</p> 
       <Link 
         to="/" 
         className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" 
       > 
         返回首页 
       </Link> 
     </div> 
   ); 
 }; 
 
 export default NotFound; 

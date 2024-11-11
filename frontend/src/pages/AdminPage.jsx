import React, { startTransition, useContext, useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/Auth'
import { Link, useNavigate } from 'react-router-dom'
import SideBar from '../components/SideBar'
import LoadingSpinner from '../components/LoadingSpinner'

const UsersList = ({allUsers,revoke,approve,deleteUser,isDeleting,isApproving,search,type,setType}) => {
    const [list,setList] = useState([])
    useEffect(()=>{
        if(search === "") setList([...allUsers])
        else{
            if(type === "name"){
              startTransition(() => {

                setList(allUsers.filter(rec => rec.name.toLowerCase().includes(search.toLowerCase())))
              })
            }
            else{
              startTransition(() => {

                setList(allUsers.filter(rec => rec.email.toLowerCase().includes(search.toLowerCase())))
              })
            }
        }
    },[search,type,allUsers])

    return (
        <table className='table-auto border-collapse border'>
                <thead>
                    <tr>
                        <th className='border border-slate-500 py-8'>Name</th>
                        <th className='border border-slate-500 py-8'>Email</th>
                        <th className='border border-slate-500 py-8'>Mobile Number</th>
                        <th className='border border-slate-500 py-8'>Active</th>
                        <th className='border border-slate-500 py-8'>Operations</th>
                    </tr>
                </thead>
                <tbody>
            {list.length > 0 ? list.map(data => {
                return (
                <tr key={data._id} className='border border-slate-500 text-center'>

                <td  className='text-white border border-slate-500'>
                    {data.name}
                </td>
                <td  className='text-white border border-slate-500'>
                    {data.email}
                </td>
                <td  className='text-white border border-slate-500'>
                    {data.mobilenumber}
                </td>
                <td  className='text-white border border-slate-500'>
                    {data.active ? "true" : "false"}
                </td>
                <td className='flex justify-center space-x-2 py-2'>
                    {(data.active) ? 
                    <button disabled={isApproving} onClick={() => revoke(data._id)} className='px-3 py-2 rounded-lg shadow-md shadow-black bg-green-600 hover:bg-green-500'>
                    {isApproving ? "Revoking.." : "Revoke"}
                </button>
                    : <button disabled={isApproving} onClick={() => approve(data._id)} className='px-3 py-2 rounded-lg shadow-md shadow-black bg-green-600 hover:bg-green-500'>
                        {isApproving ? "Approving.." : "Approve"}
                    </button>}
                    <button disabled={isDeleting} onClick={() => deleteUser(data._id)} className='px-3 py-2 rounded-lg shadow-md shadow-black bg-red-600 hover:bg-red-500'>{isDeleting ? "Deleting..." : "Delete"}</button>

                </td>
                </tr>
                )
                
            })
             :   <tr><td className=''>No data</td></tr>
            }
            </tbody>
            </table>
    )
}

const TopBar = ({ user,userDispatch,search,setSearch,type,setType }) => {
    const [isModelOpen,setIsModelOpen] = useState(false);
    const [name,setName] = useState("A")
    const [role,setRole] = useState("user")
  
    function onLogout(){
      userDispatch({type:"LOGOUT",payload:{}});
    }
  
    useEffect(() => {
    
      if(localStorage.getItem('name')){
        setName(localStorage.getItem('name'))
        setRole(localStorage.getItem('role'))
      }
      else
        {setName("A"); setRole("user")}
    },[user])
    return (
        <div className="flex justify-between mb-4">
            <div className='flex w-full space-x-4'>
                <input
                  className="w-[40%] h-12 rounded-md outline-none text-black"
                  placeholder={`Search by ${type}`}
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                  type="text"
                />
                <select onChange={(e) => {setSearch(""); setType(e.target.value)}} className='text-white bg-slate-900 border-[1px] rounded-md px-2' name="Name">
                    <option defaultValue={true} className='px-8 py-2 m-8' value="name">Name</option>
                    <option className='px-8 py-2 m-8' value="email">Email</option>   
                </select>
            </div>
            <button onClick={() => setIsModelOpen(mod => !mod)} className="rounded-full bg-white w-12 h-12 font-semibold text-black text-3xl">
              {name.charAt(0)}
            </button>
            {isModelOpen && (
              <div className='absolute right-8 top-20 mt-2 w-48 text-center text-black bg-white rounded-md shadow-lg p-2'>
                <ul>
                  <Link to={'/profile'}
                    className='px-4 py-2 block hover:bg-gray-200 cursor-pointer'
                    
                  >
                    Profile
                  </Link>
                  {(role === "admin") && <Link to={'/admin'}
                    
                    className='px-4 py-2 block hover:bg-gray-200 cursor-pointer'
                    
                  >
                    Admin
                  </Link>}
                  <button
                    className='px-4 py-2 block mx-auto hover:bg-gray-200 cursor-pointer outline-none'
                    // onClick={() => handleOptionClick('Feedback')}
                  >
                    Feedback
                  </button>
                  <button
                    className='px-4 py-2 block mx-auto bg-red-600 rounded text-white hover:bg-red-500 cursor-pointer outline-none'
                    onClick={onLogout}
                  >
                    Logout
                  </button>
                </ul>
              </div>
            )}
          
        </div>
      );
  }

const AdminPage = () => {
    const [allUsers,setAllUsers] = useState([])
    const {user,dispatch} = useContext(AuthContext)
    const [isLoading,setIsLoading] = useState(false)
    const [isApproving,setIsApproving] = useState(false)
    const [isDeleting,setIsDeleting] = useState(false)
    const [search,setSearch] = useState("")
    const [type,setType] = useState("name")
    const nav = useNavigate()
    useEffect(() => {
        setIsLoading(true)
        async function fetchUsers(){
            const res = await fetch('https://secureguard-production.up.railway.app/api/credentials/all',{
                method:'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': user
                }
            })
            if(res.ok){
                const data = await res.json()
                // console.log("data -> ",data)
                startTransition(() => {
                    setAllUsers(data)
                })
            }
            else{
                localStorage.setItem('role',"user")
                nav("/")
            }
        }

        if(!user) nav("/")
        else fetchUsers()
        setIsLoading(false)
        
    },[user])

  async function approve(userId){
      setIsApproving(true)
    try{
        const res = await fetch(`https://secureguard-production.up.railway.app/api/admin/approveUser/${userId}`,{
            method:'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': user
         }
        })
        if(res.ok){
            const data = await res.json()
            toast.success("User has been approved.",{
              autoClose : 3000,
              theme : 'dark',
              
            })
            console.log(data)
            setAllUsers(allUsers => allUsers.map(rec => {
                if(rec._id === userId) return data.user
                else return rec
            }))
        }
    }catch(err){
        console.log(err)
    }
    setIsApproving(false)
  }

  async function revoke(userId){
    setIsApproving(true)
  try{
      const res = await fetch(`https://secureguard-production.up.railway.app/api/admin/revokeUser/${userId}`,{
          method:'PUT',
          headers: {
              'Content-Type': 'application/json',
              'x-auth-token': user
       }
      })
      if(res.ok){
          const data = await res.json()
          toast.success("User has been Revoked.",{
            autoClose : 3000,
            theme : 'dark',
            
          })
        //   console.log(data)
        startTransition(() => {

          setAllUsers(allUsers => allUsers.map(rec => {
            if(rec._id === userId) return data.user
            else return rec
          }))
        })
      }
  }catch(err){
      console.log(err)
  }
  setIsApproving(false)
}

  async function deleteUser(userId){
    setIsDeleting(true)
  try{
      const res = await fetch(`https://secureguard-production.up.railway.app/api/admin/delete/${userId}`,{
          method:'DELETE',
          headers: {
              'Content-Type': 'application/json',
              'x-auth-token': user
       }
      })
      if(res.ok){
          const data = await res.json()
          console.log(data)
          toast.success("User deleted Successfully.",{
            autoClose : 3000,
            theme : 'dark',
            
          })
          startTransition(() => {

            setAllUsers(allUsers => allUsers.filter(rec => rec._id !== userId))
          })
      }
  }catch(err){
      console.log(err)
  }
  setIsDeleting(false)
}

  return (
    <div className='flex h-screen bg-gray-800 text-white'>
        <SideBar />
        <section className="w-5/6 bg-slate-900 flex flex-col p-8 overflow-y-auto">
            <TopBar user={user} userDispatch={dispatch} search={search} setSearch={setSearch} type={type} setType={setType}  />
            {isLoading ? <LoadingSpinner /> : 
            <UsersList search={search} allUsers={allUsers} revoke={revoke} deleteUser={deleteUser} approve={approve} isApproving={isApproving} isDeleting={isDeleting} type={type} setType={setType} />}
        </section>
<ToastContainer />
    </div>
  )
}

export default AdminPage

import React, { useContext, useEffect, useState, lazy, startTransition } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from "../context/Auth";
import { Link, useNavigate, useParams } from "react-router-dom";
import SideBar from "../components/SideBar";
import { VaultContext } from "../context/Vaults";
import BankSection from "../components/BankSection";
import Modal from "../components/Modal"

const MediaSection = lazy(() => import("../components/MediaSection"));

const TopBar = ({ currVault,user,userDispatch,search,setSearch }) => {
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
        <input
          className="w-[40%] h-12 rounded-md outline-none"
          placeholder={`Search ${
            currVault[1] === "" ? "" : `in ${currVault[1]}`
          }`}
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
        />
          <button onClick={() => setIsModelOpen(mod => !mod)} className="rounded-full bg-white w-12 h-12 font-semibold text-3xl">
            {name.charAt(0)}
          </button>
          {isModelOpen && (
            <div className='absolute right-8 top-20 mt-2 w-48 text-center bg-white rounded-md shadow-lg p-2'>
              <ul>
                <Link to={'/profile'}
                  className='px-4 py-2 block hover:bg-gray-200 cursor-pointer'
                  // onClick={() => handleOptionClick('Profile')}
                >
                  Profile
                </Link>
                {(role === "admin") && <Link to={'/admin'}
                  
                  className='px-4 py-2 block hover:bg-gray-200 cursor-pointer'
                  // onClick={() => handleOptionClick('Profile')}
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

const UploadBar = ({ currVault, handleUpload,setBankModelOpen }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const onFileChange = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    // console.log(file)
    if (file) {
      startTransition(() => {
        handleUpload(file);
      })
      setSelectedFile(null); // Clear the selected file after upload
    }
  };
  
  return (
    <div className="flex justify-between text-white mb-4">
      <h2 className="font-semibold text-2xl">
        <span className="text-slate-400">{currVault[0] + " > "}</span>{" "}
        {currVault[1]}
      </h2>
      <div className="flex">
        <button className="bg-white text-slate-800 ml-2 px-3 py-2 rounded-md font-semibold">
          Refresh
        </button>
        <input
          type="file"
          onChange={onFileChange}
          className="hidden"
          id="file-upload"
        />
        {
          (currVault && (currVault[0] === "Media Vaults")) ? 
          
          <button
            type="button"
            onClick={() => document.getElementById("file-upload").click()}
            className="bg-white text-slate-800 ml-2 px-3 py-2 rounded-md font-semibold"
          >
            Upload
          </button>
          :
          <button
            type="button"
            onClick={() => setBankModelOpen(true)}
            className="bg-white text-slate-800 ml-2 px-3 py-2 rounded-md font-semibold"
          >
            New info
          </button>
        }
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user,dispatch : userDispatch } = useContext(AuthContext);
  const [bankModelOpen,setBankModelOpen] = useState(false);
  const [content, setContent] = useState([]);
  const [bankContent,setBankContent] = useState([])
  const [loading, setLoading] = useState(false);
  const [search,setSearch] = useState("")
  const [searchContent,setSearchContent] = useState([])
  const { vaults, dispatch } = useContext(VaultContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [currVault, setCurrVault] = useState(["Media Vaults", ""]);


  const fetchWithCache = async (cacheName,url) => {
    const cache = await caches.open(cacheName);
    console.log(cache)
    // Try to fetch from cache
    const cachedResponse = await cache.match(url);

    if (cachedResponse) {
      // Update the cache in the background
      fetch(url,{
        headers : {
          "x-auth-token": user,
        }
      }).then((response) => {
        if (response.ok) {
          cache.put(url, response);
        }
      });
      return cachedResponse; // Return the cached response immediately
    } else {
      // If not in cache, fetch from network
      console.log("network response")
      const networkResponse = await fetch(url, {
        headers: {
          "x-auth-token": user,
        }
      });
      if (networkResponse.ok) {
        cache.put(url, networkResponse.clone());
      }
      return networkResponse;
    }
  };

  useEffect(() => {
  
    const fetchVault = async (cacheName,url) => {
      startTransition(async () => {

        setLoading(true);
        const res = await fetchWithCache(cacheName,url);
        const data = await res.json();
        if (res.ok) {
        if(cacheName === "media-cache")
          setContent(data);
        else
        setBankContent(data);
    } else {
        console.log("res -> ",data)
        toast.error(data.msg,{
          autoClose : 3000,
          theme : 'dark',
          
        })
        console.log("Something went wrong");
      }
      setLoading(false);
    })
    };

    if (!user) navigate("/");
    else{
      let cacheName = "media-cache",url = `https://secureguard-production.up.railway.app/api/media/?vaultId=${id}`;
      for (let vault of vaults.mediaVaults) {
        if (vault._id === id) {setCurrVault(["Media Vaults", vault.name]);cacheName  = "media-cache";url = `https://secureguard-production.up.railway.app/api/media/?vaultId=${id}`;break;};
      }
  
      for (let vault of vaults.bankVaults) {
        if (vault._id === id) {setCurrVault(["Bank Vaults", vault.name]); cacheName = "bank-cache";url = `https://secureguard-production.up.railway.app/api/bank/${id}`;break;};
      }
      fetchVault(cacheName,url);
    } 
    // const intervalId = setInterval(() => {
    //   fetchVault();
    // }, 150000); // 300000 ms = 5 minutes

    // return () => clearInterval(intervalId);
  }, [user, id]);

  useEffect(()=>{
    let newContent = [];
    if(currVault[0] === "Media Vaults"){
      newContent = content.filter(rec => {
        if(rec.mediaName.includes(search))
            return rec;
        return null;
      })
    }
    else {
      newContent = bankContent.filter(rec => {
        if(rec.userName.includes(search))
            return rec;
        return null;
      })
    }
    if(search === "") {setSearchContent([]);return ;}
    else {
      setSearchContent(newContent)
    }
  },[search,content,currVault])
  const handleUpload = async (file) => {
    // console.log(file)
    // setLoading(true);
    const formData = new FormData();
    const data = {
      [file.type.split("/")[0]]: file,
      vaultId: id,
    };
    formData.append(file.type.split("/")[0], file); // Append file under image, video, or audio key
    formData.append("vaultId", id);

    // console.log(data,formData)

    const res = await fetch(`https://secureguard-production.up.railway.app/api/media`, {
      method: "POST",
      headers: {
        "x-auth-token": user,
      },
      body: formData,
    });

    const newMedia = await res.json();
    if (res.ok) {
      // console.log(newMedia)
      startTransition(() => {
        setContent([...content, newMedia]);
      })
      toast.success("File uploaded successfully.",{
        autoClose : 3000,
        theme : 'dark',
        
      })
      const cache = await caches.open("media-cache");
      let url = `https://secureguard-production.up.railway.app/api/media/?vaultId=${id}`
      cache.match(url).then((cachedResponse) => {
        if (cachedResponse) {
          cachedResponse.json().then((cachedData) => {
            cache.put(
              url,
              new Response(JSON.stringify([...cachedData, newMedia]))
            );
          });
        }
      });
    } else {
      toast.error(newMedia.msg,{
        autoClose : 3000,
        theme : 'dark',
        
      })
      console.log("Something went wrong");
    }
    // setLoading(false);
  };
  
  <ToastContainer theme="dark" />
  return (
    <div className="flex h-screen">
      <SideBar />
      <section className="w-5/6 bg-slate-900 flex flex-col  text-black p-8 overflow-y-auto">
        <TopBar currVault={currVault} user={user} userDispatch={userDispatch} search={search} setSearch={setSearch} />
        <UploadBar currVault={currVault} handleUpload={handleUpload} setBankModelOpen={setBankModelOpen} />
        {(currVault && (currVault[0] === "Media Vaults"))?
          <MediaSection search={search} searchContent={searchContent} content={content} setContent={setContent} loading={loading} />
          : <BankSection search={search} searchContent = {searchContent} content={bankContent} setContent={setBankContent} loading={loading} />
        }

        <Modal isOpen={bankModelOpen} content={content} setBankContent={setBankContent} setBankModelOpen={setBankModelOpen} method="post" />
        
      </section>
    </div>
  );
};

export default Dashboard;

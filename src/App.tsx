import React, { useState } from 'react';
import { IFormData } from './Interfaces';
import { InputMask } from "@react-input/mask";
import { ReactNotifications, Store as Notification } from 'react-notifications-component';
import { fetchWithExponentialBackoff } from './Utils';
import Chat from './components/Chat';
import classNames from 'classnames';
import './App.css';
import 'react-notifications-component/dist/theme.css';


const MOCK_FORMDATA: IFormData = {
  instanceId: import.meta.env.VITE_ID_INSTANCE,
  apiToken: import.meta.env.VITE_API_TOKEN_INSTANCE,
  phone: '',
  isLoggedIn: false
};

function App(): React.ReactElement {
  const [formData, setFormData] = useState<IFormData>(MOCK_FORMDATA);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (await checkWhatsApp()) {
      setFormData((prevState: IFormData) => ({
        ...prevState,
        isLoggedIn: true
      }));
    }
    setIsLoading(false);
  };

  const checkWhatsApp = async () => {
    Notification.removeAllNotifications();
    try {
      const response = await fetchWithExponentialBackoff(`${import.meta.env.VITE_API_URL}/waInstance${formData.instanceId}/checkWhatsapp/${formData.apiToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber: formData.phone })
        });
      const json = await response.json();
      if (!json.existsWhatsapp) {
        setError('This number is absent in WhatsApp');
        console.log(error)
      }
      return json.existsWhatsapp;
    } catch (err) {
      Notification.addNotification({
        title: 'Something went wrong',
        message: (err as Error)?.message,
        type: 'danger',
        insert: 'bottom',
        container: 'bottom-center',
        animationIn: ['animate__animated', 'animate__fadeIn'],
        animationOut: ['animate__animated', 'animate__fadeOut'],
        dismiss: {
          duration: 8000,
        }
      });
      return false;
    }
  };

  const handleInputChange = (e: React.FormEvent) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prevState: IFormData) => ({
      ...prevState,
      [name]: name === 'phone' ? value.replace(/\D/g, "") : value
    }));
    setError('');
  };

  return (
    <>
      {
        !formData.isLoggedIn ?
          <form onSubmit={handleSubmit} className='py-12'>
            <div className='flex flex-col items-center justify-center p-5 bg-white text-black min-h-64 max-h-screen border-indigo-200 border-2 my-5 shadow-xl shadow-indigo-500/40 bg-white rounded-md'>
              <div className='flex flex-row items-center pb-[10px] text-slate-700'>
                <label className='pr-5 min-w-48 text-left required' htmlFor='phone'>Phone number</label>
                <InputMask
                  required
                  name='phone'
                  mask="+7 (___) ___-__-__"
                  onChange={handleInputChange}
                  replacement={{ _: /\d/ }}
                  className={classNames('w-full bg-transparent placeholder:text-slate-400 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow', { 'text-pink-600 border-pink-500': error, 'text-slate-700': !error })}
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
              <div className='flex flex-row items-center pb-[10px]'>
                <label className="pr-5 min-w-48 text-left required" htmlFor='instanceId'>Instance id</label>
                <input id='instanceId' name='instanceId' value={formData.instanceId} type='number' onChange={handleInputChange} className='w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow invalid:text-pink-600 invalid:border-pink-500' required />
              </div>
              <div className='flex flex-row items-center pb-[30px]'>
                <label className="pr-5 min-w-48 text-left required" htmlFor='apiToken'>Api token instance</label>
                <input id='apiToken' name='apiToken' type='password' value={formData.apiToken} onChange={handleInputChange} className='w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow invalid:text-pink-600 invalid:border-pink-500' required />
              </div>
              <ReactNotifications />
              <button type="submit" disabled={isLoading} className={classNames('submit text-white bg-violet-500 hover:bg-violet-600 min-w-[115px]', { isLoading: 'cursor-not-allowed pointer-events-none' })}>{!isLoading ? 'Start chat' : <span className="dots"><span> . </span><span> . </span><span> . </span></span>}</button>
              {error && <h2 className='pt-8 text-pink-600 text-bold'>{error}</h2>}
            </div>
          </form>
          :
          <Chat creds={formData} apiUrl={import.meta.env.VITE_API_URL} />
      }
    </>
  )
}

export default App

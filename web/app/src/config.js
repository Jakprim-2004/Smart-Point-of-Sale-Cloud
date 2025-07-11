const config = {
    // ใช้ Backend URL จาก Vercel (แทน localhost)
    api_path: process.env.REACT_APP_API_URL || 'https://backendpos-two.vercel.app',
    token_name: 'pos_token',
    headers: () => {
        const token = localStorage.getItem(config.token_name);
        if (!token) {
            console.error('No token found');
            return {};
        }
        
        return {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }
    }
}

export default config;

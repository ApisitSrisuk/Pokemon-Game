import axios from 'axios';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export const getPokemonByName = async (name) => {
  try {
    const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${name.toLowerCase()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching Pokemon ${name}:`, error);
    throw error;
  }
};

export const getPokemonList = async () => {
  try {
    const countResponse = await axios.get(`${POKEAPI_BASE_URL}/pokemon?limit=1`);
    const totalPokemonCount = countResponse.data.count;

    const allPokemonResponse = await axios.get(`${POKEAPI_BASE_URL}/pokemon?limit=${totalPokemonCount}`);
    return allPokemonResponse.data.results;
  } catch (error) {
    console.error('Error fetching full Pokemon list:', error);
    throw error;
  }
};

export const getMoveDetail = async (moveUrl) => {
  try {
    const response = await axios.get(moveUrl);
    return response.data; // จะมีข้อมูลเช่น name, power, accuracy, type, damage_class
  } catch (error) {
    console.error(`Error fetching move detail from ${moveUrl}:`, error);
    // Return null เพื่อให้ไม่ทำให้เกม crash ถ้า move หาไม่เจอ
    return null;
  }
};

// --- ส่วนที่เพิ่มเข้ามา: ฟังก์ชันสำหรับดึงข้อมูล Type Effectiveness ---
export const getTypeEffectiveness = async (typeName) => {
  try {
    const response = await axios.get(`${POKEAPI_BASE_URL}/type/${typeName.toLowerCase()}`);
    // console.log(`Type effectiveness for ${typeName}:`, response.data); // สามารถ uncomment เพื่อดีบั๊กได้
    return response.data.damage_relations; // ข้อมูลความสัมพันธ์การแพ้ธาตุ
  } catch (error) {
    console.error(`Error fetching type effectiveness for ${typeName}:`, error);
    return null; // Return null หากเกิดข้อผิดพลาดในการดึงข้อมูล
  }
};
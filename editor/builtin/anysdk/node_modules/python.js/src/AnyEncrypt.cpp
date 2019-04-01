#include "AnyEncrypt.h"
#include "md5.h"
#include "base64.h"


BUILD_SINGLE(AnyEncrypt)
void AnyEncrypt::log(std::string info)
{
	// std::ofstream myfile("/Users/xiaodiu/a.txt", std::ios::app);
	// myfile << info << std::endl;
	// myfile.close();
	// FILE* fp;
	// if ((fp = fopen("/Users/xiaodiu/a.txt","wb"))!=NULL){
	// 	fwrite(info, sizeof(info), 1, fp);      
	// 	fclose(fp);
	// }
}

bool AnyEncrypt::checkScript()
{
	isScriptRight = true;
	return false;
}

bool AnyEncrypt::checkMD5()
{
	PyThreadForAnyStateLock py_thread_lock;
	PyObject* funImp = getOriginalFunction("find_module");
	if (funImp == NULL) {
		return false;
	}
	
	PyObject* py_args = PyTuple_New(1);
	PyTuple_SET_ITEM(py_args, 0, PyString_FromString("python_for_js"));
	PyObject* py_result = PyObject_CallObject(funImp, py_args);
	Py_XDECREF(py_args);
	if (py_result == NULL) {
		return false;
	}
	PyObject* py_path_name = PyTuple_GetItem(py_result, 1);
	if (py_path_name == NULL) {
		return false;
	}	
	std::string pathName = PyString_AsString(py_path_name);
	FILE* file = fopen(pathName.c_str(),"rb");
	Py_XDECREF(py_result);
	if (file == NULL) {
		return false;
	}
	fseek(file, 0, SEEK_END);
	long lSize = ftell(file);
	rewind(file);
	char * buffer;
	buffer = (char *)malloc(sizeof(char)*lSize);
	if (buffer == NULL) { 
		return false;
	}
	size_t result;
	result = fread(buffer, 1, lSize, file);
	if (result != lSize) { 
		return false;
	}
	fclose(file);
	game::framework::MD5 md5;
	md5.update(buffer,lSize);
	md5.finalize();
    std::string sign = md5.hexdigest();
        if (sign == "ab546286c0af3f20b345f8162df75e8e"){
    	return true;
    }
	return false;
}

bool AnyEncrypt::checkEncrypt(std::string pythonInfo, std::string jsStack)
{
	if (!isScriptRight && m_isRelease) {
		//if script is wrong,just ignore
		return false;
	}
	if (!checkMD5()) {
		//check the md5 of python_for_js
		return false;
	}

	std::string prefix = ", file \"";
	std::string suffix = "\", ";
	int idxPrefix = pythonInfo.find(prefix);
	int idxSuffix = pythonInfo.find(suffix, idxPrefix);
	if (idxPrefix != -1 && idxSuffix != -1) {
		std::string path = pythonInfo.substr(idxPrefix + strlen(prefix.c_str()), idxSuffix - idxPrefix - strlen(prefix.c_str()));
	}

	PyThreadForAnyStateLock py_thread_lock;

	PyObject* funCheck = getPythonForJsFunction("check");
	if (funCheck == NULL) {
		return false;
	}
	timeval t;
    gettimeofday(&t, 0);
    unsigned long m_start_sec = t.tv_sec;
    char curTime[12];
    sprintf(curTime, "%lu", m_start_sec);
    std::string strTimes(curTime);
	string::size_type pos = 0;
	const string s2 = "\\";
	const string s3 = "/";
	string::size_type a = s2.size();
	string::size_type b = s3.size();
	while((pos=jsStack.find(s2,pos))!=string::npos)
	{
		jsStack.replace(pos, a, s3);
		pos += b;
	}
	std::string prefixStr = "usericon";
	prefixStr = anysdk::framework::base64::Encode((const unsigned char*)prefixStr.c_str(), strlen(prefixStr.c_str()));
	std::string suffixStr = "gameicon";
	suffixStr = anysdk::framework::base64::Encode((const unsigned char*)suffixStr.c_str(), strlen(suffixStr.c_str()));
	std::string encryptCode = prefixStr + jsStack + strTimes + suffixStr;
	game::framework::MD5 md5(encryptCode);
	std::string sign = md5.hexdigest();
	PyObject* py_args = PyTuple_New(3);
	PyTuple_SET_ITEM(py_args, 0, PyString_FromString(jsStack.c_str()));
	PyTuple_SET_ITEM(py_args, 1, PyString_FromString(strTimes.c_str()));
	PyTuple_SET_ITEM(py_args, 2, PyString_FromString(sign.c_str()));

	PyObject* py_result = PyObject_CallObject(funCheck, py_args);
	Py_XDECREF(py_args);
	if (py_result == NULL) {
		return false;
	}

	long ret = PyInt_AsLong(py_result);
	if (ret == 0){
		return false;
	}
	
	isInitFinish = true;
	return true;
}

void AnyEncrypt::savePythonForJsPath(PyObject* py_module)
{
	PyObject* objPath = PythonNamedGetter(py_module, "__file__");
	if (objPath == NULL)
		log("shit~~~");

	log(PyString_AsString(objPath));
}

PyObject * AnyEncrypt::getPythonForJsFunction(std::string funName)
{
	PyThreadForAnyStateLock py_thread_lock;

	PyObject* py_module_name = PyString_FromString("python_for_js");
	PyObject* py_module = PyImport_Import(py_module_name);
	Py_XDECREF(py_module_name);
	if (py_module == NULL) {
		return NULL;
	}

	PyObject* function = PythonNamedGetter(py_module, funName.c_str());
	if (function == NULL) {
		return NULL;
	}

	return function;
}

PyObject * AnyEncrypt::getOriginalFunction(std::string funName)
{
	PyThreadForAnyStateLock py_thread_lock;

	PyObject* py_module_name = PyString_FromString("imp");
	PyObject* py_module = PyImport_Import(py_module_name);
	Py_XDECREF(py_module_name);
	if (py_module == NULL) {
		return NULL;
	}
	PyObject* function = PythonNamedGetter(py_module, funName.c_str());
	if (function == NULL) {
		return NULL;
	}

	return function;
}

PyObject * AnyEncrypt::PythonNamedGetter(PyObject * py_object, const char * key)
{
	PyThreadForAnyStateLock py_thread_lock;

	PyObject* py_key = PyString_FromString(key);
	PyObject* py_value = NULL;

	if (PyMapping_HasKey(py_object, py_key) != 0)
		py_value = PyObject_GetItem(py_object, py_key);
	else if (PyObject_HasAttr(py_object, py_key) != 0)
		py_value = PyObject_GetAttr(py_object, py_key);

	Py_XDECREF(py_key);

	return py_value;
}


AnyEncrypt::AnyEncrypt()
{
	isScriptRight = false;
	isInitFinish = false;
	m_isRelease = false;
}


AnyEncrypt::~AnyEncrypt()
{

}

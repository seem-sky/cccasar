#ifndef ANY_ENCRYPT_H  
#define ANY_ENCRYPT_H

#include "AnyDeclare.h"
#include <string>
// #include <sstream>
// #include <iostream>
// #include <fstream>
#include <Python.h>

class AnyEncrypt
{
	DECLARE_SINGLE(AnyEncrypt)

public:
	std::string getSign();

	static void log(std::string info);

	bool checkScript();
	
	bool checkMD5();

	bool checkEncrypt(std::string pythonFile, std::string jsStack);

	void savePythonForJsPath(PyObject* py_module);

	static PyObject* getPythonForJsFunction(std::string funName);

	static PyObject* getOriginalFunction(std::string funName);

	static PyObject* PythonNamedGetter(PyObject* py_object, const char* key);

private:
	AnyEncrypt();
	~AnyEncrypt();

	bool isScriptRight; //脚本是否正确
	bool isInitFinish; //初始化是否完成
	bool m_isRelease;//是否处于release mode

};

#endif/*MD5_H*/  
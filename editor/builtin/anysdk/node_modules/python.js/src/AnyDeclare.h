#ifndef ANYDECLARE_H
#define ANYDECLARE_H

#include <stdio.h>
#include "Python.h"
//=========================== (µ¥ÀýÉùÃ÷) ====================================

#define DECLARE_SINGLE(ClassName) \
    private:\
        static ClassName* singleInstance;\
    public:\
        static ClassName* getInstance()\
        {\
            if(NULL == singleInstance) singleInstance = new ClassName();\
            return singleInstance;\
        }\
    private:\
        class CGarbo\
        {\
            public:\
            ~CGarbo()\
            {if( ClassName::singleInstance )delete ClassName::singleInstance;}\
        };\
        static CGarbo Garbo;

#define BUILD_SINGLE(ClassName)\
    ClassName* ClassName::singleInstance = NULL;
//=========================================================================


class PyThreadForAnyStateLock
{
public:
	PyThreadForAnyStateLock(void)
	{
		py_gil_state = PyGILState_Ensure();
	}

	~PyThreadForAnyStateLock(void)
	{
		PyGILState_Release(py_gil_state);
	}

private:
	PyGILState_STATE py_gil_state;
};

#endif // ANYDECLARE_H
/* MD5
 converted to C++ class by Frank Thilo (thilo@unix-ag.org)
 for bzflag (http://www.bzflag.org)

   based on:

   MD5.h and MD5.c
   reference implemantion of RFC 1321

   Copyright (C) 1991-2, RSA Data Security, Inc. Created 1991. All
rights reserved.

License to copy and use this software is granted provided that it
is identified as the "RSA Data Security, Inc. MD5 Message-Digest
Algorithm" in all material mentioning or referencing this software
or this function.

License is also granted to make and use derivative works provided
that such works are identified as "derived from the RSA Data
Security, Inc. MD5 Message-Digest Algorithm" in all material
mentioning or referencing the derived work.

RSA Data Security, Inc. makes no representations concerning either
the merchantability of this software or the suitability of this
software for any particular purpose. It is provided "as is"
without express or implied warranty of any kind.

These notices must be retained in any copies of any part of this
documentation and/or software.

*/

/* interface header */
#include "MD5.h"

/* system implementation headers */
#include <stdio.h>
#include <string.h>
#ifdef HAVE_CONFIG_H
#  include <config.h>
#endif

#include <sys/types.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "md5.h"
#ifdef WITH_DMALLOC
#  include <dmalloc.h>
#endif

namespace game { namespace framework {
// Constants for MD5Transform routine.
#define S11 7
#define S12 12
#define S13 17
#define S14 22
#define S21 5
#define S22 9
#define S23 14
#define S24 20
#define S31 4
#define S32 11
#define S33 16
#define S34 23
#define S41 6
#define S42 10
#define S43 15
#define S44 21

///////////////////////////////////////////////
// F, G, H and I are basic MD5 functions.
inline MD5::uint4 MD5::F(uint4 x, uint4 y, uint4 z) {
  return (x & y) | ((~x) & z);
}

inline MD5::uint4 MD5::G(uint4 x, uint4 y, uint4 z) {
  return (x&z) | (y&~z);
}

inline MD5::uint4 MD5::H(uint4 x, uint4 y, uint4 z) {
  return x^y^z;
}

inline MD5::uint4 MD5::I(uint4 x, uint4 y, uint4 z) {
  return y ^ (x | ~z);
}

// rotate_left rotates x left n bits.
inline MD5::uint4 MD5::rotate_left(uint4 x, int n) {
  return (x << n) | (x >> (32-n));
}

// FF, GG, HH, and II transformations for rounds 1, 2, 3, and 4.
// Rotation is separate from addition to prevent recomputation.
inline void MD5::FF(uint4 &a, uint4 b, uint4 c, uint4 d, uint4 x, uint4 s, uint4 ac) {
  a = rotate_left(a+ F(b,c,d) + x + ac, s) + b;
}

inline void MD5::GG(uint4 &a, uint4 b, uint4 c, uint4 d, uint4 x, uint4 s, uint4 ac) {
  a = rotate_left(a + G(b,c,d) + x + ac, s) + b;
}

inline void MD5::HH(uint4 &a, uint4 b, uint4 c, uint4 d, uint4 x, uint4 s, uint4 ac) {
  a = rotate_left(a + H(b,c,d) + x + ac, s) + b;
}

inline void MD5::II(uint4 &a, uint4 b, uint4 c, uint4 d, uint4 x, uint4 s, uint4 ac) {
  a = rotate_left(a + I(b,c,d) + x + ac, s) + b;
}

//////////////////////////////////////////////

// default ctor, just initailize
MD5::MD5()
{
  init();
}

//////////////////////////////////////////////

// nifty shortcut ctor, compute MD5 for string and finalize it right away
MD5::MD5(const std::string &text)
{
  init();
  update(text.c_str(), (unsigned int)text.length());
  finalize();
}

//////////////////////////////

void MD5::init()
{
  finalized=false;

  count[0] = 0;
  count[1] = 0;

  // load magic initialization constants.
  state[0] = 0x67452301;
  state[1] = 0xefcdab89;
  state[2] = 0x98badcfe;
  state[3] = 0x10325476;
}

//////////////////////////////

// decodes input (unsigned char) into output (uint4). Assumes len is a multiple of 4.
void MD5::decode(uint4 output[], const uint1 input[], size_type len)
{
  for (unsigned int i = 0, j = 0; j < len; i++, j += 4)
    output[i] = ((uint4)input[j]) | (((uint4)input[j+1]) << 8) |
      (((uint4)input[j+2]) << 16) | (((uint4)input[j+3]) << 24);
}

//////////////////////////////

// encodes input (uint4) into output (unsigned char). Assumes len is
// a multiple of 4.
void MD5::encode(uint1 output[], const uint4 input[], size_type len)
{
  for (size_type i = 0, j = 0; j < len; i++, j += 4) {
    output[j] = input[i] & 0xff;
    output[j+1] = (input[i] >> 8) & 0xff;
    output[j+2] = (input[i] >> 16) & 0xff;
    output[j+3] = (input[i] >> 24) & 0xff;
  }
}

//////////////////////////////

// apply MD5 algo on a block
void MD5::transform(const uint1 block[blocksize])
{
  uint4 a = state[0], b = state[1], c = state[2], d = state[3], x[16];
  decode (x, block, blocksize);

  /* Round 1 */
  FF (a, b, c, d, x[ 0], S11, 0xd76aa478); /* 1 */
  FF (d, a, b, c, x[ 1], S12, 0xe8c7b756); /* 2 */
  FF (c, d, a, b, x[ 2], S13, 0x242070db); /* 3 */
  FF (b, c, d, a, x[ 3], S14, 0xc1bdceee); /* 4 */
  FF (a, b, c, d, x[ 4], S11, 0xf57c0faf); /* 5 */
  FF (d, a, b, c, x[ 5], S12, 0x4787c62a); /* 6 */
  FF (c, d, a, b, x[ 6], S13, 0xa8304613); /* 7 */
  FF (b, c, d, a, x[ 7], S14, 0xfd469501); /* 8 */
  FF (a, b, c, d, x[ 8], S11, 0x698098d8); /* 9 */
  FF (d, a, b, c, x[ 9], S12, 0x8b44f7af); /* 10 */
  FF (c, d, a, b, x[10], S13, 0xffff5bb1); /* 11 */
  FF (b, c, d, a, x[11], S14, 0x895cd7be); /* 12 */
  FF (a, b, c, d, x[12], S11, 0x6b901122); /* 13 */
  FF (d, a, b, c, x[13], S12, 0xfd987193); /* 14 */
  FF (c, d, a, b, x[14], S13, 0xa679438e); /* 15 */
  FF (b, c, d, a, x[15], S14, 0x49b40821); /* 16 */

  /* Round 2 */
  GG (a, b, c, d, x[ 1], S21, 0xf61e2562); /* 17 */
  GG (d, a, b, c, x[ 6], S22, 0xc040b340); /* 18 */
  GG (c, d, a, b, x[11], S23, 0x265e5a51); /* 19 */
  GG (b, c, d, a, x[ 0], S24, 0xe9b6c7aa); /* 20 */
  GG (a, b, c, d, x[ 5], S21, 0xd62f105d); /* 21 */
  GG (d, a, b, c, x[10], S22,  0x2441453); /* 22 */
  GG (c, d, a, b, x[15], S23, 0xd8a1e681); /* 23 */
  GG (b, c, d, a, x[ 4], S24, 0xe7d3fbc8); /* 24 */
  GG (a, b, c, d, x[ 9], S21, 0x21e1cde6); /* 25 */
  GG (d, a, b, c, x[14], S22, 0xc33707d6); /* 26 */
  GG (c, d, a, b, x[ 3], S23, 0xf4d50d87); /* 27 */
  GG (b, c, d, a, x[ 8], S24, 0x455a14ed); /* 28 */
  GG (a, b, c, d, x[13], S21, 0xa9e3e905); /* 29 */
  GG (d, a, b, c, x[ 2], S22, 0xfcefa3f8); /* 30 */
  GG (c, d, a, b, x[ 7], S23, 0x676f02d9); /* 31 */
  GG (b, c, d, a, x[12], S24, 0x8d2a4c8a); /* 32 */

  /* Round 3 */
  HH (a, b, c, d, x[ 5], S31, 0xfffa3942); /* 33 */
  HH (d, a, b, c, x[ 8], S32, 0x8771f681); /* 34 */
  HH (c, d, a, b, x[11], S33, 0x6d9d6122); /* 35 */
  HH (b, c, d, a, x[14], S34, 0xfde5380c); /* 36 */
  HH (a, b, c, d, x[ 1], S31, 0xa4beea44); /* 37 */
  HH (d, a, b, c, x[ 4], S32, 0x4bdecfa9); /* 38 */
  HH (c, d, a, b, x[ 7], S33, 0xf6bb4b60); /* 39 */
  HH (b, c, d, a, x[10], S34, 0xbebfbc70); /* 40 */
  HH (a, b, c, d, x[13], S31, 0x289b7ec6); /* 41 */
  HH (d, a, b, c, x[ 0], S32, 0xeaa127fa); /* 42 */
  HH (c, d, a, b, x[ 3], S33, 0xd4ef3085); /* 43 */
  HH (b, c, d, a, x[ 6], S34,  0x4881d05); /* 44 */
  HH (a, b, c, d, x[ 9], S31, 0xd9d4d039); /* 45 */
  HH (d, a, b, c, x[12], S32, 0xe6db99e5); /* 46 */
  HH (c, d, a, b, x[15], S33, 0x1fa27cf8); /* 47 */
  HH (b, c, d, a, x[ 2], S34, 0xc4ac5665); /* 48 */

  /* Round 4 */
  II (a, b, c, d, x[ 0], S41, 0xf4292244); /* 49 */
  II (d, a, b, c, x[ 7], S42, 0x432aff97); /* 50 */
  II (c, d, a, b, x[14], S43, 0xab9423a7); /* 51 */
  II (b, c, d, a, x[ 5], S44, 0xfc93a039); /* 52 */
  II (a, b, c, d, x[12], S41, 0x655b59c3); /* 53 */
  II (d, a, b, c, x[ 3], S42, 0x8f0ccc92); /* 54 */
  II (c, d, a, b, x[10], S43, 0xffeff47d); /* 55 */
  II (b, c, d, a, x[ 1], S44, 0x85845dd1); /* 56 */
  II (a, b, c, d, x[ 8], S41, 0x6fa87e4f); /* 57 */
  II (d, a, b, c, x[15], S42, 0xfe2ce6e0); /* 58 */
  II (c, d, a, b, x[ 6], S43, 0xa3014314); /* 59 */
  II (b, c, d, a, x[13], S44, 0x4e0811a1); /* 60 */
  II (a, b, c, d, x[ 4], S41, 0xf7537e82); /* 61 */
  II (d, a, b, c, x[11], S42, 0xbd3af235); /* 62 */
  II (c, d, a, b, x[ 2], S43, 0x2ad7d2bb); /* 63 */
  II (b, c, d, a, x[ 9], S44, 0xeb86d391); /* 64 */

  state[0] += a;
  state[1] += b;
  state[2] += c;
  state[3] += d;

  // Zeroize sensitive information.
  memset(x, 0, sizeof x);
}

//////////////////////////////

// MD5 block update operation. Continues an MD5 message-digest
// operation, processing another message block
void MD5::update(const unsigned char input[], size_type length)
{
  // compute number of bytes mod 64
  size_type index = count[0] / 8 % blocksize;

  // Update number of bits
  if ((count[0] += (length << 3)) < (length << 3))
    count[1]++;
  count[1] += (length >> 29);

  // number of bytes we need to fill in buffer
  size_type firstpart = 64 - index;

  size_type i;

  // transform as many times as possible.
  if (length >= firstpart)
  {
    // fill buffer first, transform
    memcpy(&buffer[index], input, firstpart);
    transform(buffer);

    // transform chunks of blocksize (64 bytes)
    for (i = firstpart; i + blocksize <= length; i += blocksize)
      transform(&input[i]);

    index = 0;
  }
  else
    i = 0;

  // buffer remaining input
  memcpy(&buffer[index], &input[i], length-i);
}

//////////////////////////////

// for convenience provide a verson with signed char
void MD5::update(const char input[], size_type length)
{
  update((const unsigned char*)input, length);
}

//////////////////////////////

// MD5 finalization. Ends an MD5 message-digest operation, writing the
// the message digest and zeroizing the context.
MD5& MD5::finalize()
{
  static unsigned char padding[64] = {
    0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  };

  if (!finalized) {
    // Save number of bits
    unsigned char bits[8];
    encode(bits, count, 8);

    // pad out to 56 mod 64.
    size_type index = count[0] / 8 % 64;
    size_type padLen = (index < 56) ? (56 - index) : (120 - index);
    update(padding, padLen);

    // Append length (before padding)
    update(bits, 8);

    // Store state in digest
    encode(digest, state, 16);

    // Zeroize sensitive information.
    memset(buffer, 0, sizeof buffer);
    memset(count, 0, sizeof count);

    finalized=true;
  }

  return *this;
}

//////////////////////////////

// return hex representation of digest as string
std::string MD5::hexdigest() const
{
  if (!finalized)
    return "";

  char buf[33];
  for (int i=0; i<16; i++)
    sprintf(buf+i*2, "%02x", digest[i]);
  buf[32]=0;

  return std::string(buf);
}
std::string MD5::md5() const
{
  return hexdigest();
}


//////////////////////////////

std::ostream& operator<<(std::ostream& out, MD5 MD5)
{
  return out << MD5.hexdigest();
}
    
    
    
    
static void MD5Init(MD5_CTX *context);
static void MD5Update(MD5_CTX *context, unsigned char const *buf, unsigned len);
static void MD5Final(unsigned char digest[MD5_HASHBYTES], MD5_CTX *context);
static void MD5Transform(u_int32_t buf[4], u_int32_t const in[16]);
static char* MD5End(MD5_CTX *, char *);
    
    
#if __BYTE_ORDER == 1234
#define byteReverse(buf, len)   /* Nothing */
#else
    void byteReverse(unsigned char *buf, unsigned longs);
    
    /*
     * Note: this code is harmless on little-endian machines.
     */
    void byteReverse(unsigned char *buf, unsigned longs)
    {
        u_int32_t t;
        do
        {
            t = (u_int32_t) ((unsigned) buf[3] << 8 | buf[2]) << 16 |
            ((unsigned) buf[1] << 8 | buf[0]);
            *(u_int32_t *) buf = t;
            buf += 4;
        } while (--longs);
    }
#endif /* ! __BYTE_ORDER == 1234 */
    
    
    
    
    char *
    lutil_md5_file (const char *filename, char *buf)
    {
        unsigned char buffer[BUFSIZ];
        MD5_CTX ctx;
        int f,i,j;
        
        MD5Init(&ctx);
        f = open(filename,O_RDONLY);
        if (f < 0) return 0;
        while ((i = read(f,buffer,sizeof buffer)) > 0)
        {
            MD5Update(&ctx,buffer,i);
        }
        j = errno;
        close(f);
        errno = j;
        if (i < 0) return 0;
        return MD5End(&ctx, buf);
    }
    
    char *
    lutil_md5_data (const unsigned char *data, unsigned int len, char *buf)
    {
        MD5_CTX ctx;
        
        MD5Init(&ctx);
        MD5Update(&ctx,data,len);
        return MD5End(&ctx, buf);
    }
    
    
    /* Non-Interface Methods */
    
    /* from md5hl.c */
    
    char *
    MD5End(MD5_CTX *ctx, char *buf)
    {
        int i;
        unsigned char digest[MD5_HASHBYTES];
        static const char hex[]="0123456789abcdef";
        
        if (!buf)
            buf = (char *)malloc(33);
        if (!buf)
            return 0;
        MD5Final(digest,ctx);
        for (i=0;i<MD5_HASHBYTES;i++)
        {
            buf[i+i] = hex[digest[i] >> 4];
            buf[i+i+1] = hex[digest[i] & 0x0f];
        }
        buf[i+i] = '\0';
        return buf;
    }
    
    /*
     * Start MD5 accumulation.  Set bit count to 0 and buffer to mysterious
     * initialization constants.
     */
    void MD5Init(MD5_CTX *ctx)
    {
        ctx->buf[0] = 0x67452301;
        ctx->buf[1] = 0xefcdab89;
        ctx->buf[2] = 0x98badcfe;
        ctx->buf[3] = 0x10325476;
        
        ctx->bits[0] = 0;
        ctx->bits[1] = 0;
    }
    
    /*
     * Update context to reflect the concatenation of another buffer full
     * of bytes.
     */
    void MD5Update(MD5_CTX *ctx, unsigned char const *buf, unsigned len)
    {
        u_int32_t t;
        
        /* Update bitcount */
        
        t = ctx->bits[0];
        if ((ctx->bits[0] = t + ((u_int32_t) len << 3)) < t)
            ctx->bits[1]++;         /* Carry from low to high */
        ctx->bits[1] += len >> 29;
        
        t = (t >> 3) & 0x3f;        /* Bytes already in shsInfo->data */
        
        /* Handle any leading odd-sized chunks */
        
        if (t)
        {
            unsigned char *p = (unsigned char *) ctx->in + t;
            
            t = 64 - t;
            if (len < t)
            {
                memcpy(p, buf, len);
                return;
            }
            memcpy(p, buf, t);
            byteReverse(ctx->in, 16);
            MD5Transform(ctx->buf, (u_int32_t *) ctx->in);
            buf += t;
            len -= t;
        }
        /* Process data in 64-byte chunks */
        
        while (len >= 64)
        {
            memcpy(ctx->in, buf, 64);
            byteReverse(ctx->in, 16);
            MD5Transform(ctx->buf, (u_int32_t *) ctx->in);
            buf += 64;
            len -= 64;
        }
        
        /* Handle any remaining bytes of data. */
        
        memcpy(ctx->in, buf, len);
    }
    
    /*
     * Final wrapup - pad to 64-byte boundary with the bit pattern
     * 1 0* (64-bit count of bits processed, MSB-first)
     */
    void MD5Final(unsigned char digest[16], MD5_CTX *ctx)
    {
        unsigned count;
        unsigned char *p;
        
        /* Compute number of bytes mod 64 */
        count = (ctx->bits[0] >> 3) & 0x3F;
        
        /* Set the first char of padding to 0x80.  This is safe since there is
         always at least one byte free */
        p = ctx->in + count;
        *p++ = 0x80;
        
        /* Bytes of padding needed to make 64 bytes */
        count = 64 - 1 - count;
        
        /* Pad out to 56 mod 64 */
        if (count < 8)
        {
            /* Two lots of padding:  Pad the first block to 64 bytes */
            memset(p, 0, count);
            byteReverse(ctx->in, 16);
            MD5Transform(ctx->buf, (u_int32_t *) ctx->in);
            
            /* Now fill the next block with 56 bytes */
            memset(ctx->in, 0, 56);
        }
        else
        {
            /* Pad block to 56 bytes */
            memset(p, 0, count - 8);
        }
        byteReverse(ctx->in, 14);
        
        /* Append length in bits and transform */
        ((u_int32_t *) ctx->in)[14] = ctx->bits[0];
        ((u_int32_t *) ctx->in)[15] = ctx->bits[1];
        
        MD5Transform(ctx->buf, (u_int32_t *) ctx->in);
        byteReverse((unsigned char *) ctx->buf, 4);
        memcpy(digest, ctx->buf, 16);
        memset((char *) ctx, 0, sizeof(ctx));       /* In case it's sensitive */
    }
    
    /* The four core functions - F1 is optimized somewhat */
    
    /* #define F1(x, y, z) (x & y | ~x & z) */
#define F1(x, y, z) (z ^ (x & (y ^ z)))
#define F2(x, y, z) F1(z, x, y)
#define F3(x, y, z) (x ^ y ^ z)
#define F4(x, y, z) (y ^ (x | ~z))
    
    /* This is the central step in the MD5 algorithm. */
#define MD5STEP(f, w, x, y, z, data, s) \
    ( w += f(x, y, z) + data,  w = w<<s | w>>(32-s),  w += x )
    
    /*
     * The core of the MD5 algorithm, this alters an existing MD5 hash to
     * reflect the addition of 16 longwords of new data.  MD5Update blocks
     * the data and converts bytes into longwords for this routine.
     */
    void MD5Transform(u_int32_t buf[4], u_int32_t const in[16])
    {
        register u_int32_t a, b, c, d;
        
        a = buf[0];
        b = buf[1];
        c = buf[2];
        d = buf[3];
        
        MD5STEP(F1, a, b, c, d, in[0] + 0xd76aa478, 7);
        MD5STEP(F1, d, a, b, c, in[1] + 0xe8c7b756, 12);
        MD5STEP(F1, c, d, a, b, in[2] + 0x242070db, 17);
        MD5STEP(F1, b, c, d, a, in[3] + 0xc1bdceee, 22);
        MD5STEP(F1, a, b, c, d, in[4] + 0xf57c0faf, 7);
        MD5STEP(F1, d, a, b, c, in[5] + 0x4787c62a, 12);
        MD5STEP(F1, c, d, a, b, in[6] + 0xa8304613, 17);
        MD5STEP(F1, b, c, d, a, in[7] + 0xfd469501, 22);
        MD5STEP(F1, a, b, c, d, in[8] + 0x698098d8, 7);
        MD5STEP(F1, d, a, b, c, in[9] + 0x8b44f7af, 12);
        MD5STEP(F1, c, d, a, b, in[10] + 0xffff5bb1, 17);
        MD5STEP(F1, b, c, d, a, in[11] + 0x895cd7be, 22);
        MD5STEP(F1, a, b, c, d, in[12] + 0x6b901122, 7);
        MD5STEP(F1, d, a, b, c, in[13] + 0xfd987193, 12);
        MD5STEP(F1, c, d, a, b, in[14] + 0xa679438e, 17);
        MD5STEP(F1, b, c, d, a, in[15] + 0x49b40821, 22);
        
        MD5STEP(F2, a, b, c, d, in[1] + 0xf61e2562, 5);
        MD5STEP(F2, d, a, b, c, in[6] + 0xc040b340, 9);
        MD5STEP(F2, c, d, a, b, in[11] + 0x265e5a51, 14);
        MD5STEP(F2, b, c, d, a, in[0] + 0xe9b6c7aa, 20);
        MD5STEP(F2, a, b, c, d, in[5] + 0xd62f105d, 5);
        MD5STEP(F2, d, a, b, c, in[10] + 0x02441453, 9);
        MD5STEP(F2, c, d, a, b, in[15] + 0xd8a1e681, 14);
        MD5STEP(F2, b, c, d, a, in[4] + 0xe7d3fbc8, 20);
        MD5STEP(F2, a, b, c, d, in[9] + 0x21e1cde6, 5);
        MD5STEP(F2, d, a, b, c, in[14] + 0xc33707d6, 9);
        MD5STEP(F2, c, d, a, b, in[3] + 0xf4d50d87, 14);
        MD5STEP(F2, b, c, d, a, in[8] + 0x455a14ed, 20);
        MD5STEP(F2, a, b, c, d, in[13] + 0xa9e3e905, 5);
        MD5STEP(F2, d, a, b, c, in[2] + 0xfcefa3f8, 9);
        MD5STEP(F2, c, d, a, b, in[7] + 0x676f02d9, 14);
        MD5STEP(F2, b, c, d, a, in[12] + 0x8d2a4c8a, 20);
        
        MD5STEP(F3, a, b, c, d, in[5] + 0xfffa3942, 4);
        MD5STEP(F3, d, a, b, c, in[8] + 0x8771f681, 11);
        MD5STEP(F3, c, d, a, b, in[11] + 0x6d9d6122, 16);
        MD5STEP(F3, b, c, d, a, in[14] + 0xfde5380c, 23);
        MD5STEP(F3, a, b, c, d, in[1] + 0xa4beea44, 4);
        MD5STEP(F3, d, a, b, c, in[4] + 0x4bdecfa9, 11);
        MD5STEP(F3, c, d, a, b, in[7] + 0xf6bb4b60, 16);
        MD5STEP(F3, b, c, d, a, in[10] + 0xbebfbc70, 23);
        MD5STEP(F3, a, b, c, d, in[13] + 0x289b7ec6, 4);
        MD5STEP(F3, d, a, b, c, in[0] + 0xeaa127fa, 11);
        MD5STEP(F3, c, d, a, b, in[3] + 0xd4ef3085, 16);
        MD5STEP(F3, b, c, d, a, in[6] + 0x04881d05, 23);
        MD5STEP(F3, a, b, c, d, in[9] + 0xd9d4d039, 4);
        MD5STEP(F3, d, a, b, c, in[12] + 0xe6db99e5, 11);
        MD5STEP(F3, c, d, a, b, in[15] + 0x1fa27cf8, 16);
        MD5STEP(F3, b, c, d, a, in[2] + 0xc4ac5665, 23);
        
        MD5STEP(F4, a, b, c, d, in[0] + 0xf4292244, 6);
        MD5STEP(F4, d, a, b, c, in[7] + 0x432aff97, 10);
        MD5STEP(F4, c, d, a, b, in[14] + 0xab9423a7, 15);
        MD5STEP(F4, b, c, d, a, in[5] + 0xfc93a039, 21);
        MD5STEP(F4, a, b, c, d, in[12] + 0x655b59c3, 6);
        MD5STEP(F4, d, a, b, c, in[3] + 0x8f0ccc92, 10);
        MD5STEP(F4, c, d, a, b, in[10] + 0xffeff47d, 15);
        MD5STEP(F4, b, c, d, a, in[1] + 0x85845dd1, 21);
        MD5STEP(F4, a, b, c, d, in[8] + 0x6fa87e4f, 6);
        MD5STEP(F4, d, a, b, c, in[15] + 0xfe2ce6e0, 10);
        MD5STEP(F4, c, d, a, b, in[6] + 0xa3014314, 15);
        MD5STEP(F4, b, c, d, a, in[13] + 0x4e0811a1, 21);
        MD5STEP(F4, a, b, c, d, in[4] + 0xf7537e82, 6);
        MD5STEP(F4, d, a, b, c, in[11] + 0xbd3af235, 10);
        MD5STEP(F4, c, d, a, b, in[2] + 0x2ad7d2bb, 15);
        MD5STEP(F4, b, c, d, a, in[9] + 0xeb86d391, 21);
        
        buf[0] += a;
        buf[1] += b;
        buf[2] += c;
        buf[3] += d;
    }
    

    

}} // namespace game { namespace framework {
//////////////////////////////

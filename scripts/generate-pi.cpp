#include <gmpxx.h>
#include <fstream>
#include <iostream>
#include <string>
struct Sum { mpz_class p, q, t; };
Sum split(long a, long b) {
  if (b-a==1) {
    if(a==0) return {1,1,13591409};
    mpz_class k=a;
    mpz_class p=(6*k-5)*(2*k-1)*(6*k-1);
    mpz_class q=k*k*k*mpz_class("10939058860032000");
    mpz_class t=p*(13591409+545140134*k);
    if(a%2) t=-t;
    return {p,q,t};
  }
  long m=(a+b)/2;
  Sum l=split(a,m), r=split(m,b);
  return {l.p*r.p,l.q*r.q,l.t*r.q+l.p*r.t};
}
int main(int argc,char**argv) {
  if(argc!=3) return 1;
  unsigned long digits=std::stoul(argv[1]);
  unsigned long working=digits+30;
  Sum s=split(0,working/14+2);
  mpz_class scale,root,n,pi;
  mpz_ui_pow_ui(scale.get_mpz_t(),10,working);
  n=10005*scale*scale;
  mpz_sqrt(root.get_mpz_t(),n.get_mpz_t());
  pi=s.q*426880*root/s.t;
  std::string raw=pi.get_str();
  if(raw.size()!=working+1 || raw.substr(0,31)!="3141592653589793238462643383279") return 2;
  std::ofstream out(argv[2]);
  out<<raw.substr(1,digits);
  std::cout<<"Generated "<<digits<<" decimal digits of pi.\n";
}

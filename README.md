
<h1 align="center">Baliseur</h1>

###

<h2 align="center">Baliseur is a simple VS Code extension that allows you to place tags in your files and easily navigate between them</h2>

###

<h3 align="left">How does it works ?</h3>

###

<img align="right" height="200" src="https://i.imgflip.com/8kue7d.gif"  />

###

<p align="left">Any lines in your opened files that starts with "//# " (tabs and spaces not included) will be considered tags. They are listed in a TreeView in your editor, click on them to quickly access important parts of your code !</p>

###

<p align="left">("//# " are the default tag identification characters but they can be changed in the extension settings)</p>

###

<br clear="both">

<h3 align="left">Example</h3>

###

```cpp
//#Main method
//normal comment
int main() {
    std::cout << "Hello, world!" << std::endl; 
    return 0;
}
```
This will create a single "Main method" tag.

###
```cpp
int main() {
    std::cout << "Hello, world!" << std::endl; //#Main method
    return 0;
}
```
This will not create a tag.

###


###

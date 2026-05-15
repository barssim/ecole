package ma.solide.usermanagement.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class HomeController {

	interface Printing{
		public String print(String s);
	}
	interface FunctionInterfaceOneArgument {
		public int add(int i);
	}

	
	@Value("${spring.application.Desc}")
    private String desc;
	@RequestMapping("/")
     public String home(){
		Printing appDesc = s ->  "Hello World, this application " + s ;
		return(appDesc.print(desc));
     }
 }
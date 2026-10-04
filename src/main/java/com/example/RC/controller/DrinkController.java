package com.example.RC.controller;

import com.example.RC.entity.DrinkItem;
import com.example.RC.repository.DrinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drinks")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class DrinkController {

    @Autowired
    private DrinkRepository drinkRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerDrink(@RequestBody DrinkItem drinkItem) {
        DrinkItem saved = drinkRepository.save(drinkItem);
        return ResponseEntity.ok(saved);
    }
}
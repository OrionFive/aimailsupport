# Customizable Menu System for AI Mail Support

## Overview

This document outlines the design for replacing the current static menu system with a customizable one where users can define their own menu options, paths/labels, and provide custom instructions for AI responses.

## Current System Limitations

The current implementation in `backgroundMenu.ts` has several limitations:
- Menu structure is statically defined in code
- Menu options and their behaviors are hardcoded
- Instructions are hard-coded as specific types (summarize, translate, etc.)
- Limited ability to customize AI prompts and instructions
- Difficult to maintain and extend with new functionality

## Proposed Solution

A configurable menu system that allows users to:
- Create custom menu entries with user-defined labels
- Organize menu entries in hierarchical structures using dot notation (e.g., `reply.formal`)
- Define custom prompts/instructions for each menu entry with no type restrictions
- Enable/disable specific menu entries

## Key Components

### 1. Menu Configuration Data Model

The system requires a data model to represent menu items with the following key attributes:
- Unique identifier (with dot notation for hierarchy)
- Display text/label
- Applicable contexts (message display, compose, selection)
- Custom instruction text to send to LLM
- Response type (text, audio, etc.)
- Enabled/disabled status

### 2. Storage System

The configuration will be persisted using Thunderbird's storage API with:
- Versioned schema for future compatibility
- Automatic migration path for updates
- Default configurations to provide out-of-box experience

### 3. Dynamic Menu Generation

The system will:
- Generate menus dynamically from stored configurations
- Parse dot notation to create hierarchical structure (check how it currently works!)
- Ensure parent menus are created before children
- Apply proper context restrictions based on configuration

### 4. Unified Instruction Processing

Instead of separate handlers for different operations (summarize, translate, etc.):
- Single unified handler for all menu clicks
- Direct passing of custom instructions to LLM provider
- Response handling based on configured response type

### 5. Settings Interface

A user interface is needed for:
- Creating new menu items
- Editing existing menu items
- Organizing menu hierarchy
- Enabling/disabling items
- Importing/exporting configurations

## Menu Hierarchy System

The menu hierarchy will be implemented using dot notation:
- `reply` represents a top-level menu
- `reply.formal` represents a submenu under "reply"
- `reply.casual` represents another submenu under "reply"

The system will automatically:
- Create parent menus when needed
- Properly organize menus in the correct hierarchical order
- Pass only the leaf node's instruction to the LLM

## Response Types

The system will support different response types:
- Text: Standard text response displayed in panel
- Audio: Text converted to speech and played
- Other response types can be added in the future

## Default Configuration

To ensure a good out-of-box experience, the system will provide default menu configurations that:
- Replicate existing functionality in the customizable format
- Demonstrate the hierarchical menu structure
- Cover common use cases (summarize, translate, etc.)

## Implementation Plan

1. Define the data model and storage schema
2. Implement basic storage operations
3. Create the dynamic menu generation system
4. Develop the unified instruction handling
5. Build the settings interface
6. Add import/export functionality

## Considerations

### Technical Considerations
- Maintaining backward compatibility
- Performance impact of dynamic menu generation
- Ensuring all LLM providers support generic instruction processing

### UX Considerations
- Making the hierarchy system intuitive for users
- Providing clear feedback on menu operations
- Supporting migration from the existing system

By implementing this design, users will have full control over menu options and can provide custom instructions directly to the AI without being limited to predefined categories.

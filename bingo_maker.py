# Author: Jonah Hood Blaxill
# Date: 6 March 2023 

from fpdf import FPDF
import random
import os
import sys
import base64

class Bingo():
    def __init__(self, web = False):
        self.local_dir = "/home/pyodide/" if web else "" 
        #create the pdf
        self.pdf = FPDF(orientation = 'P', unit = 'in', format='Letter')
        self.pdf.add_page()

        #Place the template image to take the size of the page and center it
        self.pdf.image(self.local_dir + 'template.png', x = 0.25, y = 0.25, w = 8, h = 10.5, type = '', link = '')


        # list of all the possible bingo squares locations and size of the square
        # access is by LOCATIONS[square#][0] for x and LOCATIONS[square#][1] for y
        # the square# is 0-24 for the 25 squares working left to right, top to bottom
        LOCATIONS = [(0.32,2.45),(1.92,2.45),(3.51,2.45),(5.10,2.45),(6.69,2.45),
                    (0.32,4.1),(1.92,4.1),(3.51,4.1),(5.10,4.1),(6.69,4.1),
                    (0.32,5.75),(1.92,5.75),(3.51,5.75),(5.10,5.75),(6.69,5.75),
                    (0.32,7.45),(1.92,7.45),(3.51,7.45),(5.10,7.45),(6.69,7.45),
                    (0.32,9.1),(1.92,9.1),(3.51,9.1),(5.10,9.1),(6.69,9.1)]
        SQUARE_SIZE = 1.5

        # List of which squares are taken so we don't place two images in the same square
        # access is by taken[square#] where square# is 0-24 for the 25 squares
        # working left to right, top to bottom
        taken = [False, False, False, False, False,
                False, False, False, False, False,
                False, False, False, False, False,
                False, False, False, False, False,
                False, False, False, False, False]

        #Add name in the top left corner
        self.pdf.set_font('helvetica', 'B', 12)
        self.pdf.set_text_color(0,0,0)
        

        #place the racestarts image in the center block
        self.pdf.image(self.local_dir + 'imgs/racestarts.png', x = LOCATIONS[12][0], y = LOCATIONS[12][1], w = SQUARE_SIZE, h = SQUARE_SIZE, type = '', link = '')
        taken[12] = True

        #place the redflag, safteycar, vsc, images in random open locations
        required = [self.local_dir + 'imgs/redflag.png', self.local_dir + 'imgs/safetycar.png', self.local_dir + 'imgs/vsc.png']
        for imgLoc in required:
            #pick a random square
            square = random.randint(0,24)
            #keep picking random squares until we find one that is not taken
            while taken[square]:
                square = random.randint(0,24)
            #place the image in the square
            self.pdf.image(imgLoc, x = LOCATIONS[square][0], y = LOCATIONS[square][1], w = SQUARE_SIZE, h = SQUARE_SIZE, type = '', link = '')
            #mark the square as taken
            taken[square] = True

        #get a list of all the images in the imgs directory
        imgs = os.listdir(self.local_dir + 'imgs')
        #remove the images we have already placed
        imgs.remove('racestarts.png')
        imgs.remove('redflag.png')
        imgs.remove('safetycar.png')
        imgs.remove('vsc.png')

        #place 21 random images in random open locations without duplicates
        for i in range(21):
            #pick a random image
            img = random.choice(imgs)
            #pick a random square
            square = random.randint(0,24)
            #keep picking random squares until we find one that is not taken
            while taken[square]:
                square = random.randint(0,24)
            #place the image in the square
            self.pdf.image(self.local_dir + 'imgs/' + img, x = LOCATIONS[square][0], y = LOCATIONS[square][1], w = SQUARE_SIZE, h = SQUARE_SIZE, type = '', link = '')
            #mark the square as taken
            taken[square] = True
            #remove the image from the list so we don't place it again
            imgs.remove(img)

    def name(self, name):
        self.pdf.text(0.32, 0.2, name)
    
    def save(self):
        #output the bingo card to the current directory
        self.pdf.output(self.local_dir + 'bingo_card.pdf', 'F')
    
    def base64_export(self):
        #read the pdf into a string
        with open(self.local_dir + 'bingo_card.pdf', 'rb') as f:
            pdf = f.read()
        #encode the pdf as base64
        encoded_string = base64.b64encode(pdf)
        #return the encoded string
        return encoded_string.decode('utf-8')

    

if __name__ == '__main__':
    card = Bingo()
    if len(sys.argv) != 2:
        print('Usage: python bingo_maker.py <name>')
    else:
        card.name(sys.argv[1])
    card.save()
